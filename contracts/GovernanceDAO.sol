// SPDX-License-Identifier: GPL-3.0-only
// Разработчик: Upaut

pragma solidity ^0.8.16;

contract GovernanceDAO {

    struct UserData { // структура описывающая данные каждого участника
        uint256 index; // индекс участника
        uint256 votes; // сколько раз всего голосовал участник
        uint256 entered; // после какого голосования добавился участник
        address userAddr; // адрес участника (упростит задачу frontend)
        string name; // имя участника
    }

    struct ProposalData { // структура описывающая данные каждого предложения для голосования
        uint256 id; // уникальный номер предложения (упростит задачу frontend)
        uint256 time; // Дата создания предложения
        uint256 reward; // награда для участников голосования
        uint256 deadLine; // крайний срок голосования
        address owner; // адрес инициатора предложения
        uint8 status; // текущий статус предложения (1 - голосование, 2 - завершено, 3 - исполнено)
        string comment; // комментарий к предложению
        address[] vocesYes; // сколько участников проголосовало за предложение
        address[] vocesNo; // сколько участников проголосовало против предложения

        address to; // вызываемый контракт при исполнении данного предложения
        bytes data; // данные транзакции
    }

    uint256 public total_voting; // всего голосований
    uint256 public total_close_voting; // всего завершенных голосований    
    uint256 public total_user; // всего пользователей в DAO
    uint256 public expire_period = 3 days; // сколько дней отведено на голосование (возможное значение от 3 до 14 дней)
    uint256 public min_payment_DAO = 100 * 1e18; // минимальная оплата за вынесение предложения на голосование для членов DAO.
    uint256 public min_payment_other = 10000 * 1e18; // минимальная оплата за вынесение предложения на голосование для не членов DAO.

    mapping(uint256 => address) private indexes; // адреса участников по индексу
    mapping(address => UserData) private users; // связь пользователей с их структурой данных
    mapping(uint256 => ProposalData) private proposals; // список всех предложений
    mapping(uint256 => mapping(address => bool)) private rewards; // награды за голосование

    event CreateProposal(uint indexed _id, uint _reward); // ID предложения и награда за голосование
    event Vote(address indexed _sender, uint indexed _id, bool _answer); // Участник, ID предложения, решение
    event ChangeStatus(uint indexed _id, uint8 _status); // ID предложения, новый статус
    event Claim(address indexed _sender, uint indexed _id, uint _pay); // Участник, ID предложения, сколько было выплачено

    modifier onlyThis() {
        require(address(this) == msg.sender, "Only GovernanceDAO");
        _;
    }

    constructor(address _firstUser, string memory _name)
    {
        ++total_user; // увеличиваем количество участников
        indexes[total_user] = _firstUser; // привязываем адрес участника к индексу
        users[_firstUser] = UserData(total_user, 0, 0, _firstUser, _name); // инициализация данных участника
    }


    function setExpirePeriod(uint256 _period) external onlyThis { // установить новый период голосования
        if((_period >= 3 days) && (_period <= 14 days)) expire_period = _period; // новый период должен быть в диапазоне от 3 до 14 дней (включительно)
    }

    function setMinPayments(uint256 _min_payment_DAO, uint256 _min_payment_other) external onlyThis { // установить новые минимальные сборы за вынесение предложения на голосование
        min_payment_DAO = _min_payment_DAO; // минимальная оплата за вынесение предложения на голосование для членов DAO.
        min_payment_other = _min_payment_other; // минимальная оплата за вынесение предложения на голосование для не членов DAO.
    }

    function addUserInDAO(address _user, string calldata _name) external onlyThis { // добавить нового участника
        if(_user == address(0)) return; // участник не может иметь нулевой адрес
        if (users[_user].index == 0){ // только новый участник 
            ++total_user; // увеличиваем количество участников
            indexes[total_user] = _user; // привязываем адрес участника к индексу
            users[_user] = UserData(total_user, 0, total_close_voting, _user, _name); // инициализация данных участника
        }
    }

    function delUserInDAO(address _user) external onlyThis { // удалить участника из DAO
        uint256 _ind = users[_user].index; // индекс удаляемого участника
        if (_ind > 0){ // только существующий участник 
            if(_ind != total_user){ // индекс участника непоследний
                indexes[_ind] = indexes[total_user]; // привязываем адрес последнего участника к новому индексу
                users[indexes[_ind]].index = _ind; // меняем индекс в данных последнего участника
            }
            delete indexes[total_user]; // обнуляем последний индекс
            delete users[_user]; // удаляем данные участника
            --total_user; // уменьшаем количество участников
        }
    }



    function createProposal(address _contract, bytes calldata _data, string calldata _comment) payable external { // создание предложения
        // _contract - адрес контракта, который будет вызван при принятии этого предложения
        // _data - данные вызова (функция и аргументы), закодированные через encodeABI()
        // _comment - краткий комментарий к предложению, возможно ссылка на github с proposal

        if(users[msg.sender].index > 0){ // адрес который выдвигает предложение состоит в DAO
            require(msg.value >= min_payment_DAO, "small payment"); // проверка оплаты предложения
        }
        else{ // адрес который выдвигает предложение не состоит в DAO
            require(msg.value >= min_payment_other, "small payment"); // проверка оплаты предложения
        }

        ++total_voting; // идентификатор нового голосования
        proposals[total_voting].id = total_voting; // уникальный номер предложения
        proposals[total_voting].time = block.timestamp; // Дата создания предложения
        proposals[total_voting].reward = msg.value; // награда для участников голосования
        proposals[total_voting].deadLine = block.timestamp + expire_period; // крайний срок голосования
        proposals[total_voting].owner = msg.sender; // адрес инициатора предложения
        proposals[total_voting].status = 1; // текущий статус предложения
        proposals[total_voting].comment = _comment; // комментарий к предложению
        proposals[total_voting].to = _contract; // вызываемый контракт при исполнении данного предложения
        proposals[total_voting].data = _data; // данные транзакции

        emit CreateProposal(total_voting, msg.value); // логируем ID предложения и награду за голосование
    }


    function vote(uint _id, bool _answer) external { // голосование
        // _id - идентификатор предложения
        // _answer - ваш ответ (0 - отклонить предложение, 1 - одобрить предложение)

        require(proposals[_id].time > 0, "proposal does not exist"); // проверяем что предложение существует
        if(proposals[_id].status > 1) return; // голосование по данному предложению завершено
        if(block.timestamp > proposals[_id].deadLine){ // время голосования истекло
            proposals[_id].status = 2; // голосование завершено
            ++total_close_voting; // увеличиваем количество завершенных голосований
            emit ChangeStatus(_id, 2); // ID предложения, новый статус
            return;
        }

        uint _index = users[msg.sender].index; // получим индекс голосующего в списке DAO
        require(_index > 0, "you are not a member"); // проверяем что голосующий состоит в DAO
        require(!rewards[_id][msg.sender], "you have already voted"); // проверяем что голосующий, ранее не голосовал за это предложение

        rewards[_id][msg.sender] = true; // подтверждаем принятие голоса c фиксацией выплаты за это голосование
        users[msg.sender].votes++; // увеличиваем количество всех голосований участника

        emit Vote(msg.sender, _id, _answer); // логируем участника, ID предложения, принятое решение

        if(_answer){ // голос отдан за принятие предложения
            proposals[_id].vocesYes.push(msg.sender);
        }
        else{ // голос отдан за отклонение предложения
            proposals[_id].vocesNo.push(msg.sender);
        }


        uint _amount_votes = proposals[_id].vocesYes.length + proposals[_id].vocesNo.length; // количество проголосовавших
        if(_amount_votes >= total_user){ // если все участники DAO проголосовали, то голосование досрочно завершаем
            proposals[_id].status = 2; // голосование завершено
            ++total_close_voting; // увеличиваем количество завершенных голосований
            emit ChangeStatus(_id, 2); // ID предложения, новый статус
        }
    }


    function execute(uint _id) external { // Исполнение предложения
        // _id - идентификатор предложения
        require(proposals[_id].status == 2, "proposal is not completed"); // только завершенное предложение можно привести к исполнению
        proposals[_id].status = 3; // меняем статус на состояние "Исполнено"
        if(proposals[_id].vocesYes.length > proposals[_id].vocesNo.length){ // если большинство проголосовало за принятия предложения, то приводим его в исполнение
            _execute(proposals[_id].to, proposals[_id].data);
        }
        emit ChangeStatus(_id, 3); // ID предложения, новый статус
    }

    function _execute(address _to, bytes memory _data) private {
        (bool success,) = _to.call(_data);
        require(success, "Execute error");
    }


    function claim(uint _id) external { // Получить вознаграждение за проведенное голосование
        // _id - идентификатор предложения
        require(proposals[_id].status > 1, "proposal is not completed"); // награду можно требовать только когда голосование завершено
        require(rewards[_id][msg.sender], "no payment"); // проверяем имеет ли отправитель право на выплату
        rewards[_id][msg.sender] = false; // фиксируем выплату отправителю

        uint _amount_votes = proposals[_id].vocesYes.length + proposals[_id].vocesNo.length; // количество проголосовавших
        uint _pay = proposals[_id].reward / _amount_votes; // расчет выплаты для каждого участника
        payable(msg.sender).transfer(_pay); // выплата
        emit Claim(msg.sender, _id, _pay); // Участник, ID предложения, сколько было выплачено
    }



    // ФУНКЦИИ ЧТЕНИЯ

    function getUser(address _user) public view returns (UserData memory) { // Возвращаем данные конкретного пользователя по его адресу
        return (users[_user]);
    }

    function getUsersList(uint _start_index, uint _amount) public view returns (UserData[] memory) { // Возвращаем данные нескольких пользователей из списка
        UserData[] memory _result = new UserData[](_amount);  
        for(uint i; i < _amount; i++) _result[i] = getUser(indexes[_start_index++]);
        return (_result);
    }

    function getProposal(uint _id) public view returns (ProposalData memory) { // Возвращаем данные конкретного предложения по его ID
        return (proposals[_id]);
    }

    function getProposalsList(uint _start_ID, uint _amount) public view returns (ProposalData[] memory) { // Возвращаем данные нескольких предложений из списка от _start_ID к более старым
        _start_ID = ((_start_ID == 0) || (_start_ID > total_voting)) ? total_voting : _start_ID; // если запрашивается индекс = 0 или индекс превышающий последнее предложение, то возврат предложений делается от последнего предложения
        ProposalData[] memory _result = new ProposalData[](_amount); 

        for(uint i; i < _amount; i++){
            if(_start_ID == 0) break; // выход, если все предложения обработаны досрочно
            _result[i] = getProposal(_start_ID--);
        } 
        return (_result);
    }

    function checkClaim(uint _id, address _user) public view returns (bool) { // Проверяет наличие вознаграждения для указанного адреса, в указанном предложении
        return (rewards[_id][_user]);
    }

    function getClaimList(address _user, uint _start_ID, uint _amount) public view returns (uint [] memory, bool [] memory) { // Возвращаем массив предложений и массив наград для указанного адреса (от _start_ID к более старым предложениям)
        // _user - адрес для которого смотрим награды
        // _start_ID - с какого предложения начинать вести поиск наград
        // _amount - количество просматриваемых предложений
         _start_ID = ((_start_ID == 0) || (_start_ID > total_voting)) ? total_voting : _start_ID; // если запрашивается индекс = 0 или индекс превышающий последнее предложение, то возврат предложений делается от последнего предложения
        uint[] memory _proposalID = new uint[](_amount);
        bool[] memory _claim = new bool[](_amount);

        for(uint i; i < _amount; i++){
            if(_start_ID == 0) break; // выход, если все предложения обработаны досрочно
            _proposalID[i] = _start_ID;
            _claim[i] = rewards[_start_ID][_user];
            --_start_ID;
        } 
        return (_proposalID, _claim);
    }
}
        