// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPoIAgent {
    function getPoIScore(address who) external view returns (uint256);
}

contract LeaderElection {
    IPoIAgent public poiAgent;
    mapping(address => uint256) public stake;
    address[] public validators;

    uint256 public alpha;
    uint256 public beta;
    uint256 public gamma;

    event ValidatorAdded(address indexed who, uint256 stakeAmount);
    event ParametersUpdated(uint256 alpha, uint256 beta, uint256 gamma);
    event LeaderElected(address indexed leader, uint256 score);

    constructor(address _poiAgent, uint256 _alpha, uint256 _beta, uint256 _gamma) {
        poiAgent = IPoIAgent(_poiAgent);
        alpha = _alpha; beta = _beta; gamma = _gamma;
    }

    function addValidator(uint256 amount) external {
        require(amount > 0, "Must stake >0");
        if (stake[msg.sender] == 0) {
            validators.push(msg.sender);
        }
        stake[msg.sender] += amount;
        emit ValidatorAdded(msg.sender, stake[msg.sender]);
    }

    function updateParams(uint256 _a, uint256 _b, uint256 _g) external {
        alpha = _a; beta = _b; gamma = _g;
        emit ParametersUpdated(_a, _b, _g);
    }

    function electLeader() external returns (address) {
        address best;
        uint256 bestScore;
        for (uint i = 0; i < validators.length; i++) {
            address v = validators[i];
            uint256 s = stake[v] * alpha
                + _mockUptimeScore(v) * beta
                + poiAgent.getPoIScore(v) * gamma;
            if (s > bestScore) {
                bestScore = s;
                best = v;
            }
        }
        require(best != address(0), "No validators");
        emit LeaderElected(best, bestScore);
        return best;
    }

    function _mockUptimeScore(address) internal view returns (uint256) {
        return 1;
    }
}
