// SPDX-License-Identifier: GPL-3.0-only
// Разработчик: Upaut

pragma solidity ^0.8.16;

interface IERC20 {
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
}


contract Treasury {

    struct RecipientData { // структура описывающая данные каждого получателя
        uint256 percent; // установленный процент получателя
        uint256 balance; // баланс получателя
    }

    address public callistoNetwork = 0xeBE894814554c8382EA6a24CcDdf1527407A24f6; // Первый получатель
    address public callistoCommunity = 0x810059e1406dEDAFd1BdCa4E0137CbA306c0Ce36; // Второй получатель

    mapping(address => RecipientData) private recipients; // связь получателей с их структурой данных

    event ChangeRecipient(address indexed _old, address indexed _new);
    event TransferPercent(address indexed _sender, uint _percent);
    event TransferCLO(address indexed _sender, address indexed _recipient, uint _value);


    modifier onlyRecipients() {
        require((msg.sender == callistoNetwork) || (msg.sender == callistoCommunity), "Only recipient");
        _;
    }

    constructor()
    {
        // Проценты имеют decimal = 18
        recipients[callistoNetwork].percent = 50 * 1e18; // 50% от трежери для CallistoNetwork
        recipients[callistoCommunity].percent = 50 * 1e18; // 50% от трежери для сообщества Callisto
    }


    function changeRecepient(address _newRecepient) external onlyRecipients // изменение адреса получателя. Новый получатель сохраняет за собой право на проценты и баланс старого получателя
    {
        uint256 _percent = recipients[msg.sender].percent; // процент старого получателя
        uint256 _balance = recipients[msg.sender].balance; // баланс старого получателя
        delete recipients[msg.sender]; // удаляем данные старого получателя

        // Инициализируем данные нового получателя
        recipients[_newRecepient] = RecipientData(_percent, _balance);
        (callistoNetwork, callistoCommunity) = msg.sender == callistoNetwork ? (_newRecepient, callistoCommunity) : (callistoNetwork, _newRecepient);

        emit ChangeRecipient(msg.sender, _newRecepient); // логируем изменение получателя
    }


    function transferPercent(uint256 _percent) external onlyRecipients // передача части процента под управление второго получателя
    {
        uint256 _tekPercent = recipients[msg.sender].percent; // текущий процент получателя
        require(_percent <= _tekPercent); // проверяем что отправитель имеет в распоряжении передаваемые проценты
        
        _balanceDistribution(); // получатели делят нераспределенный баланс трежери

        // передаем управление процентом второму получателю
        (recipients[callistoNetwork].percent, recipients[callistoCommunity].percent) = msg.sender == callistoNetwork ? (_tekPercent - _percent, recipients[callistoCommunity].percent + _percent) : (recipients[callistoNetwork].percent + _percent, _tekPercent - _percent);
        emit TransferPercent(msg.sender, _percent); // логируем передачу процента отправителем
    }


    function transferCLO(address _recipient, uint256 _value) external onlyRecipients // отправка CLO
    {
        require((_recipient != address(0x00)) && (_recipient != address(this))); // получателем не может быть нулевой адрес, или контракт трежери
        _balanceDistribution(); // получатели делят нераспределенный баланс трежери

        uint256 _tekBalance = recipients[msg.sender].balance; // текущий баланс отправителя
        require(_value <= _tekBalance); // проверяем что отправитель имеет в распоряжении достаточный баланс

        recipients[msg.sender].balance = _tekBalance - _value; // корректировка баланса отправителя
        payable(_recipient).transfer(_value); // отправляем CLO получателю

        emit TransferCLO(msg.sender, _recipient, _value); // логируем отправку CLO
    }


    function transferToken(address _token, address _recipient, uint256 _value) external // отправка токена
    {
        require(msg.sender == callistoCommunity); // Распоряжаться любыми токенами разрешено только сообществу
        require((_recipient != address(0x00)) && (_recipient != address(this))); // получателем не может быть нулевой адрес, или контракт трежери
        IERC20(_token).transfer(_recipient, _value); // отправляем токен получателю
    }



    function _balanceDistribution() private { // распределение CLO в трежери, между получателями
        uint256 _cn = recipients[callistoNetwork].balance; // текущий баланс callistoNetwork
        uint256 _cc = recipients[callistoCommunity].balance; // текущий баланс callistoCommunity
        uint256 _contractBalance = address(this).balance - (_cn + _cc); // получаем нераспределенный баланс нативной монеты у контракта трежери
        uint256 _cnShare = recipients[callistoNetwork].percent * _contractBalance / (100 * 1e18); // рассчитываем долю callistoNetwork в свободных CLO у контракта
        recipients[callistoNetwork].balance = _cn + _cnShare; // передаем эту долю в распоряжение callistoNetwork
        recipients[callistoCommunity].balance = _cc + (_contractBalance - _cnShare); // остаток переходит под управление callistoCommunity
    }


    function getRecipientData(address _recipient) public view returns (RecipientData memory) // Возвращаем текущий процент и текущий баланс CLO у получателя
    {   
        RecipientData memory _result;
        uint256 _cn = recipients[callistoNetwork].balance; // текущий баланс callistoNetwork
        uint256 _cc = recipients[callistoCommunity].balance; // текущий баланс callistoCommunity
        uint256 _contractBalance = address(this).balance - (_cn + _cc); // получаем нераспределенный баланс нативной монеты у контракта трежери
        uint256 _share = recipients[_recipient].percent * _contractBalance / (100 * 1e18); // рассчитываем долю запрошенного получателя
        _result = RecipientData(recipients[_recipient].percent, recipients[_recipient].balance + _share); // получаем текущий процент и весь доступный баланс для запрошенного получателя
        return (_result); // возвращаем массив с инфой по токенам
    }


    function getBalanceToken(address _token) public view returns (uint256, uint8, string memory) // Возвращаем текущий баланс контракта в запрошенном токене, а также количество десятичных знаков и символ данного токена
    {   
        uint _balance = IERC20(_token).balanceOf(address(this)); // получаем баланс этого контракта в запрошенном токене
        uint8 _decimal = IERC20(_token).decimals(); // получаем количество десятичных знаков у запрошенного токена
        string memory _symb = IERC20(_token).symbol(); // Получаем символ токена
        return (_balance, _decimal, _symb);
    }


    // Контракт принимает пожертвования в нативной монете, любые токены ERC223 и ERC20
    // Любые пожертвования в токенах ERC223 и ERC20 переходят под управление сообществом в полном объеме

    receive() external payable {} // принимаем CLO. Он будет распределен между получателями согласно установленным процентам

    function tokenReceived(address _from, uint _value, bytes memory _data) public returns (bytes4) { // принимаем токены ERC223
        return this.tokenReceived.selector; // возвращаем селектор этой функции
    }

}        