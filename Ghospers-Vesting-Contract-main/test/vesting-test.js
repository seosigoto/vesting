const { time } = require('@openzeppelin/test-helpers');
const { expect } = require("chai");
const { ethers } = require('hardhat');

const BN = ethers.BigNumber;

const Name = "Test Token";
const Symbol = "TEST";
const Decimals = BN.from(18);
const OneToken = BN.from(10).pow(Decimals);
const moment = require('moment')

describe("Token test", function () {
    let tokenInst, vesting;

    const inititalSupply = OneToken.mul(100000000);
    const lockedTotalSupply = OneToken.mul(75000000);

    beforeEach(async () => {
        // deploy Token
        const Token = await ethers.getContractFactory("Token");
        tokenInst = await Token.deploy(inititalSupply);
		
		const GhospTokenVesting = await ethers.getContractFactory("GhospTokenVesting");
		vesting = await GhospTokenVesting.deploy(tokenInst.address)
		await tokenInst.transfer(vesting.address, lockedTotalSupply)

		const balanceOfContract = await tokenInst.balanceOf(vesting.address)
		console.log("balance of contract is:" + ethers.utils.formatEther(balanceOfContract));
		
    });

    it("Vesting test", async () => {
        const [owner] = await ethers.getSigners();

		for(let i = 0; i < 25; i++) {
			const time = await vesting.vestingTimeList(i);
			for(let j = 0; j < 11; j++) {
				const member = await vesting.members(j);
				const amount = ethers.utils.formatEther((await vesting.vestingTimeScheduleList(time, member))[0])
				const day = moment.unix(time).format("YYYY-MM-DD")
				console.log(`${day} - ${member} - ${amount}`)
			}
			console.log('\n');
		}
    });

	it("should successfully send tokens to first account", async() => {
		await time.increaseTo(1635526800 + 1);
        const [owner] = await ethers.getSigners();

		await vesting.addAdmin(owner.address)
		await vesting.unlockToken();

		const balance = await tokenInst.balanceOf('0x0C25363022587299510774E036ad078682991256')
		console.log("balance is:" + ethers.utils.formatEther(balance));
	})

	it("should successfully send all tokens", async() => {
		await time.increaseTo(1703955600 + 1);
        const [owner] = await ethers.getSigners();

		await vesting.addAdmin(owner.address)
		for(let i = 0; i < 25; i++) {
			await vesting.unlockToken();
		}

		const balance = await tokenInst.balanceOf('0x0C25363022587299510774E036ad078682991256')
		console.log("balance is:" + ethers.utils.formatEther(balance));

		const balanceOfContract = await tokenInst.balanceOf(vesting.address)
		console.log("balance of contract is:" + ethers.utils.formatEther(balanceOfContract));
	})

});
