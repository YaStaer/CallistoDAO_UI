// SPDX-License-Identifier: GPL-3.0-only
// Разработчик: Upaut

pragma solidity ^0.8.16;

interface ITwoBearsBots {
    function id() external view returns (uint256);
    function createBotSellBuy(address _token_in, address _token_out, uint _value, uint _value_inc, uint _price, uint _price_step, uint _price_limit, uint _order_position) external;
    function createBotNetTrade(address _token_in, address _token_out, uint _value_sell, uint _value_buy, uint _price, uint _price_step, uint _price_up_limit, uint _price_down_limit, uint _order_position_sell, uint _order_position_buy) external;
    function restoreBot(uint _id_bot) external;
    function deleteBot(uint _id_bot) external;
}

interface IColdStaking {
    function start_staking(uint rounds) external payable;
    function claim() external;
    function withdraw_stake() external;
}

interface IERC20 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

interface IWCLO {
    function deposit() external payable;
    function withdraw(uint wad) external;
}

contract WalletDAO {

    struct TokenData { // структура вывода информации по токену
        uint256 balance; // баланс токена в walletDAO
        uint8 decimal; // количество десятичных знаков у токена
        address token; // адрес контракта токена
        string symbol; // символ токена
    }

    address public constant DAO = 0xb356A5a5710Cac1677854f1b95608D1d4B4B417d; // Контракт DAO
    address public constant WCLO = 0xbd2D3BCe975FD72E44A73cC8e834aD1B8441BdDa; // Контракт WCLO
    address public constant ColdStaking = 0xBD38997D00295D738BDC258DB4446577f4181Ed7; // Контракт ColdStaking
    address public constant TwoBearsBalances = 0x1501Bffb3D83239214AE55eCE3a4ccd40092c922; // Контракт депозитов на 2bears
    address public constant TwoBearsBots = 0x69b78bF6300a39D186C7850A46ea6CA261c265c3; // Контракт ботов на 2bears
    
    uint[] public listBots; // список всех запущенных ботов на 2bears
    //uint lastIndex; // индекс последнего бота в списке
    address[] tokenTrackingList; // список адресов токенов для отcлеживания в UI

    event TransferCLO(address indexed _sender, address indexed _recipient, uint _value);

    modifier onlyDAO() {
        require(msg.sender == DAO, "Only contract DAO");
        _;
    }


    // Контракт кошелька DAO работает с 2bears
    function twoBears_Approve(address _token, bool _permission) external onlyDAO { // Выдать/отозвать разрешение ботам торговать токеном
        uint _val = _permission == true ? uint(int(-1)) : 0;
        IERC20(_token).approve(TwoBearsBalances, _val); // даем/отзываем разрешение на использование токена
    }

    function twoBears_BotSellBuy(address _token_in, address _token_out, uint _value, uint _value_inc, uint _price, uint _price_step, uint _price_limit) external onlyDAO { // создание бота закупа или бота распродажи
        // _value - объем токена с наименьшим приоритетом
        // _price - цена в токене с максимальным приоритетом
        ITwoBearsBots(TwoBearsBots).createBotSellBuy(_token_in, _token_out, _value, _value_inc, _price, _price_step, _price_limit, 0);
        uint _id_bot = ITwoBearsBots(TwoBearsBots).id(); // возвращаем id созданного бота
        _add_ID_listBots(_id_bot); // сохраняем ID бота в списке отслеживаний
    }

    function twoBears_BotNetTrade(address _token_in, address _token_out, uint _value_sell, uint _value_buy, uint _price, uint _price_step, uint _price_up_limit, uint _price_down_limit) external onlyDAO { // создание бота сеточной торговли
        // _value_sell и _value_buy - объем токена с наименьшим приоритетом
        // _price - цена в токене с максимальным приоритетом
        ITwoBearsBots(TwoBearsBots).createBotNetTrade(_token_in, _token_out, _value_sell, _value_buy, _price, _price_step, _price_up_limit, _price_down_limit, 0, 0);
        uint _id_bot = ITwoBearsBots(TwoBearsBots).id(); // возвращаем id созданного бота
        _add_ID_listBots(_id_bot); // сохраняем ID бота в списке отслеживаний
    }

    function twoBears_RestoreBot(uint _id_bot) external onlyDAO { // Восстановить работу бота после устранения неисправности
        ITwoBearsBots(TwoBearsBots).restoreBot(_id_bot);
    }

    function twoBears_DeleteBot(uint _id_bot) external onlyDAO { // Удалить бота (все ордера данного бота будут отменены, все средства вернутся на кошелек DAO)
        ITwoBearsBots(TwoBearsBots).deleteBot(_id_bot);
        _del_ID_listBots(_id_bot);
    }

    function _add_ID_listBots(uint _id_bot) private { // Добавление ID нового бота в список
        listBots.push(_id_bot);
    }

    function _del_ID_listBots(uint _id_bot) private { // Удаление ID бота из списка
        for(uint i; i < listBots.length; i++){
            if(listBots[i] == _id_bot){
                listBots[i] = listBots[listBots.length - 1];
                listBots.pop();
                break;
            }
        }
    }

/*
    function _add_ID_listBots(uint _id_bot) private { // Добавление ID нового бота в список
        listBots[lastIndex] = _id_bot;
        ++lastIndex;
    }

    function _del_ID_listBots(uint _id_bot) private { // Удаление ID бота из списка
        for(uint i; i < lastIndex; i++){
            if(listBots[i] == _id_bot){
                --lastIndex;
                listBots[i] = listBots[lastIndex];
                delete listBots[lastIndex];
                break;
            }
        }
    }
*/



    // Контракт кошелька DAO работает с ColdStaking
    function coldStaking_Start(uint256 _value, uint256 _rounds) external onlyDAO { // Сделать ставку. _value - количество CLO, _rounds - количество раундов
        IColdStaking(ColdStaking).start_staking{value: _value}(_rounds);
    }

    function coldStaking_Claim() external onlyDAO { // Забрать награду (claim)
        IColdStaking(ColdStaking).claim();
    }

    function coldStaking_Withdraw() external onlyDAO { // Забрать ставку (withdraw_stake)
        IColdStaking(ColdStaking).withdraw_stake();
    }



    // Контракт кошелька DAO оборачивает CLO и разворачивает WCLO
    function walletDAO_WrapCLO(uint256 _value) external onlyDAO { // обернуть CLO в WCLO
        IWCLO(WCLO).deposit{value: _value}();
    }

    function walletDAO_UnwrapWCLO(uint256 _value) external onlyDAO { // развернуть WCLO в CLO
        IWCLO(WCLO).withdraw(_value);
    }



    // Контракт кошелька DAO отправляет CLO и любые токены стандартов ERC20, ERC223
    function walletDAO_TransferCLO(address _recipient, uint256 _value) external onlyDAO { // отправка CLO
        payable(_recipient).transfer(_value); // отправляем CLO
        emit TransferCLO(address(this), _recipient, _value); // логируем отправку CLO
    }

    function walletDAO_TransferToken(address _token, address _recipient, uint256 _value) external onlyDAO { // отправка любого токена
        IERC20(_token).transfer(_recipient, _value); // отправляем токен
    }



    // Контракт кошелька DAO добавляет / удаляет токены для отслеживания в UI
    function walletDAO_AddTokenTracking(address _token) external onlyDAO { // Добавить токен для отслеживания
        if(IERC20(_token).decimals() > 0){ // перестраховка что добавляется контракт имеющий десятичные знаки
            tokenTrackingList.push(_token);
        }
    }

    function walletDAO_DelTokenTracking(address _token) external onlyDAO { // Удалить токен из отслеживаемых
        for(uint i; i < tokenTrackingList.length; i++){
            if(tokenTrackingList[i] == _token){
                tokenTrackingList[i] = tokenTrackingList[tokenTrackingList.length - 1];
                tokenTrackingList.pop();
                break;
            }
        }
    }

    function walletDAO_ViewBalances() public view returns (TokenData[] memory) { // Просмотреть балансы кошелька
        TokenData[] memory _result = new TokenData[](tokenTrackingList.length + 1);  // + 1 это для вывода нативного CLO
        _result[0] = TokenData(address(this).balance, 18, address(0x00), "CLO"); // Информация нативной монеты сети

        for(uint i; i < tokenTrackingList.length; i++){ // перебираем весь массив токенов
            address _token = tokenTrackingList[i];
            _result[i+1] = TokenData(IERC20(_token).balanceOf(address(this)), IERC20(_token).decimals(), _token, IERC20(_token).symbol());
        }
        return (_result); // возвращаем балансы и информацию по заданным токенам
    }



    // Контракт кошелька DAO примимает CLO и любые токены стандартов ERC20, ERC223
    receive() external payable {} // принимаем CLO

    function tokenReceived(address _from, uint _value, bytes memory _data) public returns (bytes4) { // принимаем токены ERC223
        return this.tokenReceived.selector; // возвращаем селектор этой функции
    }
}        