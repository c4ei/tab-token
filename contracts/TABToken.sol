// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract TABToken is ERC20Upgradeable, OwnableUpgradeable, PausableUpgradeable, UUPSUpgradeable {
    // 락된 토큰 수량을 저장하는 매핑
    mapping(address => uint256) private _lockedBalances;

    // 초기화 함수 (생성자 역할)
    function initialize() public initializer {
        __ERC20_init("TAB", "TAB");
        __Ownable_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        _mint(msg.sender, 100_000_000 * 10 ** decimals());  // 1억 개 발행
    }

    // 추가 발행 기능
    function mint(address to, uint256 amount) public onlyOwner whenNotPaused {
        _mint(to, amount);
    }

    // 토큰 소각 기능
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    // 특정 계좌의 락된 토큰 수량 조회
    function lockedBalanceOf(address account) public view returns (uint256) {
        return _lockedBalances[account];
    }

    // 락된 토큰 수량 설정
    function setLockedBalance(address account, uint256 amount) public onlyOwner {
        _lockedBalances[account] = amount;
    }

    // 계약 전체 일시 중지 기능
    function pause() public onlyOwner {
        _pause();
    }

    // 계약 일시 중지 해제 기능
    function unpause() public onlyOwner {
        _unpause();
    }

    // 토큰 전송 기능을 재정의하여 정지된 계좌의 토큰 전송을 방지
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        require(!paused(), "Contract is paused");
        require(balanceOf(from) - _lockedBalances[from] >= amount, "Insufficient unlocked balance");
        super._beforeTokenTransfer(from, to, amount);
    }

    // 업그레이드 권한을 오너에게만 부여
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
