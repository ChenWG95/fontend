/**
https://leetcode-cn.com/problems/maximum-subarray/
给定一个整数数组 nums ，找到一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。

示例:

输入: [-2,1,-3,4,-1,2,1,-5,4]
输出: 6
解释: 连续子数组 [4,-1,2,1] 的和最大，为 6。
进阶:

如果你已经实现复杂度为 O(n) 的解法，尝试使用更为精妙的分治法求解
*/

/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
  // 1. 变量为nums
  // 2. 状态遍历
  // 3. 择优
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      nums[i] + nums[j]
    }
  }
}

// 遍历方法
// 1. 头部遍历
// 2. 长度遍历
// 3. 尾部遍历

// Kadane算法扫描一次整个数列的所有数值，
// 在每一个扫描点计算以该点数值为结束点的子数列的最大和（正数和）。
// 该子数列由两部分组成：以前一个位置为结束点的最大子数列、该位置的数值。
// 因为该算法用到了“最佳子结构”（以每个位置为终点的最大子数列都是基于其前一位置的最大子数列计算得出, 
// 该算法可看成动态规划的一个例子。
// 状态转移方程：sum[i] = max{sum[i-1]+a[i],a[i]}   
// 其中(sum[i]记录以a[i]为子序列末端的最大序子列连续和)
function  maxSubArray2  ( nums ) {
  if (!nums.length) {
      return;
  };
  // 在每一个扫描点计算以该点数值为结束点的子数列的最大和（正数和）。
  let max_ending_here = nums[0];
  let max_so_far = nums[0];

  for (let i = 1; i < nums.length; i ++ ) {
      // 以每个位置为终点的最大子数列 都是基于其前一位置的最大子数列计算得出,

      max_ending_here = Math.max ( nums[i], max_ending_here + nums[i]);
      max_so_far = Math.max ( max_so_far, max_ending_here);
  };

  return max_so_far;
};

// 动态规划，尾部递归
function maxSubArray (nums) {
  let max_ending_here = nums[0]
  let max_so_far = nums[0]
  for (let i = 1; i <= nums.length; i++) {
    max_ending_here = Math.max(nums[i], nums[i] + max_ending_here)
    max_so_far = Math.max(max_ending_here, max_so_far)
  }
  return max_so_far
}

function maxSubArray (nums) {
  let max_ending_here = nums[0]
  let max_so_far = nums[0]

  for (let i = 1; i <= nums.length; i++) {
    max_ending_here = Math.max(nums[i], max_ending_here + nums[i])
    max_so_far = Math.max(max_ending_here, max_so_far)
  }

  return max_so_far
}

// 解题思路：
// 1. 连续，则可得出 值 = 前一个节点的连续最大值 + 当前节点
// 2. 比较：当前节点的连续最大值 = Math.max(前一个节点的连续最大值 + 当前节点, 当前节点)
// 3. 记录：当前节点最大时，Math.max(当前节点连续最大值, 目前最大的节点连续最大值)
// 当前和前一个连续节点的和最大值比较，< 当前则选择当前，> 当前则选择相+

// 难点2: 初始值sum = 0
function maxSubArray (nums) {
  let sum = 0 // 当前节点连续最大值
  let ans = nums[0] // 历史节点连续最大值

  for (num of nums) {
    if (sum + num > num) {
      sum += num
    } else {
      sum = num
    }

    ans = Math.max(ans, sum)
  }
  return ans
}

var maxSubArray = function(nums) {
  let ans = nums[0];
  let sum = Number.MIN_VALUE; // 当前最大连续子序列和
  for(const num of nums) {
      if(sum > 0) { // sum + num > num
          sum += num;
      } else {
          sum = num;
      }
      ans = Math.max(ans, sum);
  }
  return ans;
};

var maxSubArray = function(nums) {
  // nums.length = n，则下标为 0 ~ n-1
  // a[i] = nums[i]
  // f(i)第i个数结尾的【连续子数组的最大和】

  let pre = 0, maxAns = nums[0]
  nums.forEach((x) => {
      pre = Math.max(pre + x, x)
      maxAns = Math.max(maxAns, pre)
  })
  return maxAns
}

// 解题思路：
// 拆分问题，找到问题与子问题之间的关系
// 如果自问题与问题之间存在 问题 = 子问题 + 当前，则可使用动态规划
// 动态规划，尾部遍历
function maxSubArray (nums) {
  let sum = 0
  let ans = nums[0]

  for (let num of nums) {
    if (sum + num > num) { // 正向作用则加上
      sum += num
    } else {  // 否则重置（初始化第一个/有负向推动）
      sum = num
    }

    ans = Math.max(ans, sum)
  }

  return ans
}
