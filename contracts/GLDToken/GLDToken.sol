// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol"; // questo contratto ci serve per impostare la max supply
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol"; // questo contratto ci serve per poterrendere il token burnable

contract GLDToken is ERC20Capped, ERC20Burnable {  // ERC20Capped estende già ERC20 quindi non serve estendere ERC20. Invece estendendo ERC20Burnable abbiamo reso automaticamete il token burnable
    
    address payable public owner; // l'account che deploya il contratto
    uint internal  constant OWNER_TOKENS = 70000000;
    uint internal constant TOKEN_SIZE = 10 ** 18; // 10 ** decimals() equivale a  10 ** 18, infatti decimals vale 18 di default. Però nella costante non posso mettere decimals() quindi metterò 18
    string internal constant TOKEN_NAME = "Gold";
    string internal constant TOKEN_TICKER = "GLD";
    uint public blockReward;

    constructor(uint cap, uint reward) ERC20(TOKEN_NAME, TOKEN_TICKER) ERC20Capped(cap * TOKEN_SIZE){ // Quando passeremo la cap al costruttore non avremo bisogno di moltiplicarla per 10^18
        owner = payable(msg.sender); // siccome owner è stata definita come payable bisogna fare il cast a payable di msg.sender
        _mint(owner, OWNER_TOKENS * TOKEN_SIZE); //  initialSupply = OWNER_TOKENS * TOKEN_SIZE = 70 milioni x 10^18
        blockReward = reward * TOKEN_SIZE; // è la reward per aver minato il blocco
    }

    // Avendo esteso sia il contratto ERC20 che ERC20Capped, entrambi con la funzione _mint, il compilatore vuole che facciamo l'override della funzione _mint perché non sa quale usare
    // Quindi noi abbiamo incollato qui la funzione _mint presa da gld-token\node_modules\@openzeppelin\contracts\token\ERC20\extensions\ERC20Capped.sol.
    function _mint(address account, uint256 amount) internal virtual override(ERC20Capped, ERC20) {  // (ERC20Capped, ERC20) questo l'abbiamo aggiunto in più rispetto a quenato presente nella funzione _mint di ERC20Capped
        require(ERC20.totalSupply() + amount <= cap(), "ERC20Capped: cap exceeded");
        super._mint(account, amount);
    }
    
    // https://docs.openzeppelin.com/contracts/3.x/api/token/erc20#ERC20-_beforeTokenTransfer-address-address-uint256-:~:text=if%20it%20does.-,_beforeTokenTransfer(address%20from%2C%20address%20to%2C%20uint256%20amount),-internal
    // _beforeTokenTransfer(address from, address to, uint256 amount) 
    // E' un hook che viene richiamato prima del trasferimento di token (include minting e burning)
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override { // virtual override è la sintassi per fare l'override di una funzione
        if(from != address(0) && to != block.coinbase && block.coinbase != address(0)){  // from != address(0) serve per assicurarsi che sia un indirizzo valido. Infatti address(0) è l'indirizzo 0x0 che serve per creare i contratti o per bruciare le ether/token perché non ha una private key. && to != block.coinbase per evitare che mandiamo una reward per la reward che sfocierebbe in un loop infinito.
            _mintMinerReward();
        }
        super._beforeTokenTransfer(from, to, amount);
    }

    function _mintMinerReward() internal {
        // https://docs.openzeppelin.com/contracts/3.x/api/token/erc20#ERC20Capped-_beforeTokenTransfer-address-address-uint256-:~:text=_mint(address%20account%2C%20uint256%20amount)
        // _mint(address account, uint256 amount) mint crea un amount di token e li trasferisce ad account aumentando la total supply
        _mint(block.coinbase, blockReward); // account è chi riceve i nuovi coin minati quindi è l'account del nodo che sta aggiungendo il blocco alla blockchain. Questo account lo recuperiamo con block.coinbase. La blockReward inveced dipende da quanto impostiamo in fase di deploy del progetto nella variabile reward. _mint significa che stiamo chiamando la funzione da un contratto derivato (quindi che eredita da un altro contratto)
    } 

    function setBlockReward(uint reward) public onlyOwner(){
        blockReward = reward * TOKEN_SIZE;
    }

    // Questa funzione serve per  distruggere il contratto in futuro se ne abbiamo bisogno
    // Infatti se non abbiamo questa funzione il contratto vivrà per sempre 
    function destroy() public onlyOwner {
        selfdestruct(owner);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
}