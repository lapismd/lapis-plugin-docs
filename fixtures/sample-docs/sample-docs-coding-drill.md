---
schemaVersion: cvstudio.docs.note.v4
id: sample-docs-coding-drill
title: Sample docs coding drill
docType: coding-drill
summary: Sample docs coding drill fixture for docs coding-drill rendering.
learningGoal: Exercise the coding-drill document type in filters, metadata, and display output.
aliases:
  - coding drill
tags:
  - books/sample-docs
  - sample
  - sample/docs/coding-drill
  - coding-drill
  - code/java/samples
  - algorithms/two-pointer
bookId: sample-docs-index
createdAt: 2026-07-01T09:00:00.000Z
updatedAt: 2026-11-08T20:26:56.494Z
blocks:
  - id: coding-two-sum
    type: prompt
    title: Two pointer drill
    problem: Return indices for a sorted two-sum target.
    requirements:
      - O(n) time
      - O(1) extra space
      - Explain duplicate handling
    approach: Move the low or high pointer based on the current sum.
    traps:
      - Returning values instead of indices
      - Skipping duplicate values incorrectly
    tests:
      - "[2, 7, 11, 15], target 9"
      - "[1, 1, 3], target 2"
    answer: Use two pointers and preserve original index assumptions in the prompt.
cards:
  - id: card-two-sum-practice
    type: coding
    status: active
    prompt: Two Sum
    answer: Return the first pair of indices whose values add to the target. Compare the implementation
      against the public examples before submitting.
    tags:
      - sample
      - code/java/samples
      - algorithms/two-pointer
      - algorithms
    sourceRefs:
      - "[^detail]"
    blockRefs:
      - coding-two-sum
    exercise:
      id: two-sum
      difficulty: easy
      description: Given an array of integers and a target, return the indices of two distinct elements
        whose values add to the target.
      constraints:
        - Return exactly two indices.
        - The public examples use zero-based indices.
      signature:
        className: Solution
        methodName: twoSum
        parameters:
          - name: nums
            type: int[]
          - name: target
            type: int
        returnType: int[]
      languages:
        - language: python
          version: 3.14.6
          fileName: solution.py
          starterCode: |
            class Solution:
                def twoSum(self, nums, target):
                    return []
        - language: java
          version: 25.0.3
          fileName: Solution.java
          starterCode: |
            class Solution {
              int[] twoSum(int[] nums, int target) {
                return new int[] {};
              }
            }
        - language: kotlin
          version: 2.4.0
          fileName: Solution.kt
          starterCode: |
            class Solution {
              fun twoSum(nums: IntArray, target: Int): IntArray {
                return intArrayOf()
              }
            }
      examples:
        - id: example-nine
          title: Target 9
          arguments:
            - - 2
              - 7
              - 11
              - 15
            - 9
          expected:
            - 0
            - 1
        - id: example-six
          title: Target 6
          arguments:
            - - 3
              - 2
              - 4
            - 6
          expected:
            - 1
            - 2
      hints:
        - id: remember-complements
          title: Start with complements
          body: As you scan each number, ask whether the value needed to reach the target has already
            appeared.
        - id: preserve-indexes
          title: Preserve the earlier index
          body: Store each value with its index after checking its complement, so an element is never paired
            with itself.
      solutions:
        - language: python
          explanation: A hash map records each prior value and its index, giving linear time and linear extra
            space.
          code: |
            class Solution:
                def twoSum(self, nums, target):
                    seen = {}
                    for index, value in enumerate(nums):
                        complement = target - value
                        if complement in seen:
                            return [seen[complement], index]
                        seen[value] = index
                    return []
        - language: java
          explanation: Check the complement before storing the current value to keep the two indices distinct.
          code: >
            import java.util.HashMap;

            import java.util.Map;


            class Solution {
              int[] twoSum(int[] nums, int target) {
                Map<Integer, Integer> seen = new HashMap<>();
                for (int index = 0; index < nums.length; index++) {
                  int complement = target - nums[index];
                  if (seen.containsKey(complement)) return new int[] { seen.get(complement), index };
                  seen.put(nums[index], index);
                }
                return new int[] {};
              }
            }
        - language: kotlin
          explanation: The same complement map approach maps directly to Kotlin's mutableMapOf.
          code: |
            class Solution {
              fun twoSum(nums: IntArray, target: Int): IntArray {
                val seen = mutableMapOf<Int, Int>()
                for (index in nums.indices) {
                  val complement = target - nums[index]
                  seen[complement]?.let { return intArrayOf(it, index) }
                  seen[nums[index]] = index
                }
                return intArrayOf()
              }
            }
---

Back to [[sample-docs-schema-harness|the schema harness]].
