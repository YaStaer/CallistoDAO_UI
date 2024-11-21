// SPDX-License-Identifier: GPL-3.0-only
// Author: Upaut (CallistoDAO)

pragma solidity ^0.8.16;

interface IContractGraphLib {
    function getIcon(bytes32 _hash) external view returns (string memory);
}

contract DaoApprovedResources {
    struct Group{ // структура описывающая группу
        uint64 id; // идентификатор группы
        uint64 elem; // количество медиаресурсов в группе
        uint64 next; // указатель на следующую группу
        uint64 prev; // указатель на предыдущую группу
        string name; // название группы (имена групп и медиаресурсов должны быть уникальны)
        string icon; // хэш иконки в контракте графической библиотеки
    }

    struct Resource{ // структура описывающая медиаресурс
        uint64 id; // идентификатор медиаресурса
        uint64 parent; // ID родительской группы
        uint64 next; // указатель на следующий медиаресурс
        uint64 prev; // указатель на предыдущий медиаресурс
        string name; // название медиаресурса (имена групп и медиаресурсов должны быть уникальны)
        string link; // ссылка на медиаресурс
        string metadata; // описание ресурса
        string icon; // хэш иконки в контракте графической библиотеки
    }    

    uint64 id; // хранит последний порядковый номер ID выделяемый для новых групп и медиаресурсов (увеличивается на 1 каждый раз когда добавляются новые группы и медиаресурсы)
    address public GovernanceDAO = 0x810059e1406dEDAFd1BdCa4E0137CbA306c0Ce36; // Адрес голосования DAO
    address public constant contractGraphLib = 0xFe2bbc3D86C3e4666D3E352f68B2a224cAC28238; // Контракт графической библитотеки

    mapping(bytes32 => uint64) private ids; // сопоставление хешей уникальных имен с id
    mapping(uint64 => Group) private groups; // двухсвязный список всех групп
    mapping(uint64 => mapping(uint64 => Resource)) private resources; // двухсвязные списки ресурсов закрепленные за группами

    modifier onlyDAO() {
        require(msg.sender == GovernanceDAO, "Only DAO can call this");
        _;
    }



    // Создание новой группы
    function createGroup(string memory _name, bytes32 _icon) external onlyDAO {
        require(bytes(_name).length != 0); // Имя новой группы не должно быть пустой строкой
        require(_getID(_name) == 0); // Имя новой группы должно быть свободно
        id++; // уникальный идентификатор новой группы
        ids[_getHash(_name)] = id; // сопоставление хеша имени группы с id
        groups[id] = Group(id, 0, 0, groups[0].prev, _name, string(abi.encodePacked(_icon))); // инициализация новой группы с добавлением ее в список групп
        groups[groups[0].prev].next = id; // последний элемент списка ссылается на созданную группу
        groups[0].prev = id; // замыкаем двухсвязный список групп в круг
        groups[0].elem++; // увеличиваем общее количество групп
    }



    // Изменение имени группы + замена иконки группы
    function renameGroup(string memory _name, string memory _new_name, bytes32 _new_icon) external onlyDAO {
        uint64 _id = _getID(_name);
        require(groups[_id].id > 0); // группа которая подлежит переименованию должна существовать
        require(bytes(_new_name).length != 0); // Имя новой группы не должно быть пустой строкой
        require(_getID(_new_name) == 0); // Имя новой группы должно быть свободно
        ids[_getHash(_new_name)] = _id; // сопоставление хеша имени группы с id
        groups[_id].name = _new_name;
        groups[_id].icon = string(abi.encodePacked(_new_icon));
        delete ids[_getHash(_name)]; // убираем сопоставление хеша старого имени группы с id
    }



    // Перемещения группы в позицию после группы указаной в _after_name
    function moveGroup(string memory _name, string memory _after_name) external onlyDAO {
        uint64 _id = _getID(_name); // id перемещаемой группы
        uint64 _after_id = _getID(_after_name); // id группы, после которой будет расположена перемещаемая группа
        require(_id != _after_id); // группы должны быть разными
        require((groups[_id].id > 0) && (groups[_after_id].id > 0)); // группы должны существовать
        groups[groups[_id].prev].next = groups[_id].next;
        groups[groups[_id].next].prev = groups[_id].prev;
        groups[_id].next = groups[_after_id].next;
        groups[_id].prev = _after_id;
        groups[_after_id].next = _id;
        groups[groups[_id].next].prev = _id;
    }



    // Удаление группы (группа удаляется со всеми ее медиа ресурсами)
    function deleteGroup(string memory _name) external onlyDAO {
        uint64 _id = _getID(_name);
        require(groups[_id].id > 0); // группа которая подлежит удалению должна существовать
        ids[_getHash(_name)] = 0; // удаляем сопоставление хеша имени группы с id
        // убираем группу из списка групп
        groups[groups[_id].prev].next = groups[_id].next;
        groups[groups[_id].next].prev = groups[_id].prev;
        // удаляем все связанные с группой ресурсы
        uint64 _id_res = resources[_id][0].next; // получаем id первого ресурса группы
        delete resources[_id][0];
        for(uint i; i < groups[_id].elem; i++){
            uint64 _id_next = resources[_id][_id_res].next;
            ids[_getHash(resources[_id][_id_res].name)] = 0; // удаляем сопоставление хеша имени медиаресурса с id
            delete resources[_id][_id_res];
            _id_res = _id_next;
        }
        groups[0].elem--; // уменьшаем общее количество групп
        delete groups[_id]; // удаляем группу
    }



    // Создание нового медиаресурса
    function createResource(string memory _group, string memory _name, string memory _link, string memory _metadata, bytes32 _icon) external onlyDAO {
        uint64 _id_group = _getID(_group);
        require(groups[_id_group].id > 0); // группа в которой создается ресурс должна существовать
        require(bytes(_name).length != 0); // Имя нового медиаресурса не должно быть пустой строкой
        require(_getID(_name) == 0); // Имя создаваемого ресурса должно быть свободно
        require(bytes(_link).length != 0); // ссылка на медиаресурс не должна быть пустой строкой
        id++; // уникальный идентификатор нового медиаресурса
        ids[_getHash(_name)] = id; // сопоставление хеша имени медиаресурса с id
        resources[_id_group][id] = Resource(id, _id_group, 0, resources[_id_group][0].prev, _name, _link, _metadata, string(abi.encodePacked(_icon)));
        resources[_id_group][resources[_id_group][0].prev].next = id;
        resources[_id_group][0].prev = id;
        groups[_id_group].elem++; // увеличиваем общее количество медиаресурсов входящих в группу
    }



    // Перемещение медиаресурса в указанную группу с указанием позиции вставки.
    // Новая позиция вставки будет после медиаресурса указанного в _after_name
    function moveResource(string memory _from_group, string memory _name, string memory _in_group, string memory _after_name) external onlyDAO {
        uint64 _fromGroupID = _getID(_from_group); // получаем ID группы с перемещаемым медиаресурсом
        uint64 _id = _getID(_name); // id перемещаемого медиаресурса
        uint64 _inGroupID = _getID(_in_group); // получаем ID группы куда будет перемещен медиаресурс
        uint64 _after_id = _getID(_after_name); // id медиаресурса, после которого будет расположен перемещаемаемый медиаресурс
        require(_id != _after_id); // медиаресурсы должны быть разными
        require((resources[_fromGroupID][_id].id > 0) && (resources[_inGroupID][_after_id].id > 0)); // медиаресурсы в указанных группах должны существовать
        // отвязываем медиаресурс в исходной группе
        resources[_fromGroupID][resources[_fromGroupID][_id].prev].next = resources[_fromGroupID][_id].next;
        resources[_fromGroupID][resources[_fromGroupID][_id].next].prev = resources[_fromGroupID][_id].prev;
        if(_fromGroupID != _inGroupID){ // если медиаресурс перемещается между разными группами
            resources[_inGroupID][_id] = resources[_fromGroupID][_id]; // копируем медиаресурс в принимающую группу
            resources[_inGroupID][_id].parent = _inGroupID; // меняем ID родительской группы      
            groups[_fromGroupID].elem--; // уменьшаем количество медиаресурсов в исходящей группе
            groups[_inGroupID].elem++; // увеличиваем количество медиаресурсов в принимающей группе
            delete resources[_fromGroupID][_id]; // удаляем медиаресурс из исходящей группы
        }
        // привязываем медиаресурс в принимающей группе
        resources[_inGroupID][_id].next = resources[_inGroupID][_after_id].next;
        resources[_inGroupID][_id].prev = _after_id;
        resources[_inGroupID][_after_id].next = _id;
        resources[_inGroupID][resources[_inGroupID][_id].next].prev = _id;
    }



    // Удаление медиаресурса в группе
    function deleteResource(string memory _from_group, string memory _name) external onlyDAO {
        uint64 _fromGroupID = _getID(_from_group); // получаем ID группы
        uint64 _id = _getID(_name); // id медиаресурса
        require(resources[_fromGroupID][_id].id > 0); // медиаресурс в группе должен существовать
        ids[_getHash(_name)] = 0; // удаляем сопоставление хеша имени медиаресурса с id
        // отвязываем медиаресурс в группе
        resources[_fromGroupID][resources[_fromGroupID][_id].prev].next = resources[_fromGroupID][_id].next;
        resources[_fromGroupID][resources[_fromGroupID][_id].next].prev = resources[_fromGroupID][_id].prev;
        groups[_fromGroupID].elem--; // уменьшаем количество медиаресурсов в группе
        delete resources[_fromGroupID][_id]; // удаляем медиаресурс из группы
    }




    // Возвращаем количество созданных групп
    function totalGroups() public view returns (uint64){
        return (groups[0].elem);
    }

    // Возвращаем группу по ее имени
    function getGroup(string memory _name) public view returns (Group memory){
        Group memory result = groups[_getID(_name)];
        result.icon = IContractGraphLib(contractGraphLib).getIcon(bytes32(bytes(result.icon)));
        return (result);
    }

    // Возвращаем медиаресурс по его имени и имени группы где он расположен
    function getResource(string memory _group_name, string memory _resource_name) public view returns (Resource memory){
        Resource memory result = resources[_getID(_group_name)][_getID(_resource_name)];
        result.icon = IContractGraphLib(contractGraphLib).getIcon(bytes32(bytes(result.icon)));
        return (result);
    }

    // Возвращаем массив с запрашиваемым количеством групп, начиная со следующего ID после запрошенного в _id_start
    // Для возврата списка групп с самого начала укажите _id_start = 0
    // Функция создана для удобных порционных запросов из Frontend
    function getGroups(uint64 _id_start, uint64 _amount) public view returns (Group[] memory){
        _id_start = groups[_id_start].next; // получаем ID следующей группы
        if(_id_start == 0) return (new Group[](1)); // если стартовый ID не существует или он последний элемент списка
        Group[] memory result = new Group[](_amount);
        for(uint64 i; i < _amount; i++){
            if(_id_start == 0) break;
            result[i] = groups[_id_start];
            result[i].icon = IContractGraphLib(contractGraphLib).getIcon(bytes32(bytes(result[i].icon)));
            _id_start = groups[_id_start].next;
        }
        return (result); // возвращаем массив с группами
    }


    // Возвращаем массив с запрашиваемым количеством медиаресурсов, начиная с группы указаной в _id_group_start и медиаресорсом указанным после _id_resource_start
    // Для возврата списка медиаресурсов с самого начала укажите _id_group_start = 0 и _id_resource_start = 0
    // Функция создана для удобных порционных запросов из Frontend
    function getResources(uint64 _id_group_start, uint64 _id_resource_start, uint64 _amount) public view returns (Resource[] memory){
        _id_group_start = _id_group_start > 0 ? _id_group_start : groups[_id_group_start].next; // определяем стартовую группу
        _id_resource_start = resources[_id_group_start][_id_resource_start].next;
        if(_id_resource_start == 0){ // если ID медиаресурса не существует или список был закончен
            _id_group_start = groups[_id_group_start].next; // переходим к следующей группе
            _id_resource_start = resources[_id_group_start][0].next; // переходим к первому ресурсу в группе
            if((_id_group_start == 0) && (_id_resource_start == 0)) return (new Resource[](1));
        }
        Resource[] memory result = new Resource[](_amount);
        uint64 _index;
        while((_id_group_start > 0) && (_index < _amount)){ // перебираем все медиаресурсы пока имеются родительские группы и не набрано запрошенное количество медиаресурсов
            if(_id_resource_start == 0){ // если в текущей группе больше нет медиаресурсов
                _id_group_start = groups[_id_group_start].next; // переходим к следующей группе
                _id_resource_start = resources[_id_group_start][0].next; // переходим к первому ресурсу в группе
                continue;
            }
            result[_index] = resources[_id_group_start][_id_resource_start];
            result[_index].icon = IContractGraphLib(contractGraphLib).getIcon(bytes32(bytes(result[_index].icon)));
            _index++;
            _id_resource_start = resources[_id_group_start][_id_resource_start].next; // переходим к первому ресурсу в группе
        }
        return (result); // возвращаем массив с медиаресурсами
    }



    // Назначить нового владельца (замена адреса ДАО)
    function setNewOwner(address _newOwner) external onlyDAO {
        GovernanceDAO = _newOwner;
    }

    function _getHash(string memory _name) private pure returns (bytes32){ // возвращает хеш уникального имени
        return (keccak256(abi.encodePacked(_name)));
    }

    function _getID(string memory _name) private view returns (uint64){ // возвращает ID присвоенное уникальному имени
        return (ids[_getHash(_name)]);
    }    
}