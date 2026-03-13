import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"
import {
  Plus,
  Trash2,
  Code2,
  FileText,
  Lightbulb,
  BookOpen,
  CheckCircle2,
  Download,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { axiosInstance } from "../lib/axios"
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const problemSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  constraints: z.string().min(1, "Constraints are required"),
  hints: z.string().optional(),
  editorial: z.string().optional(),
  testCases: z
    .array(
      z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required"),
      })
    )
    .min(1, "At least one test case is required"),
  examples: z.object({
    JAVASCRIPT: z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
      explanation: z.string().optional(),
    }),
    PYTHON: z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
      explanation: z.string().optional(),
    }),
    JAVA: z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
      explanation: z.string().optional(),
    }),
  }),
  codeSnippets: z.object({
    JAVASCRIPT: z.string().min(1, "JavaScript code snippet is required"),
    PYTHON: z.string().min(1, "Python code snippet is required"),
    JAVA: z.string().min(1, "Java solution is required"),
  }),
  codeWrappers: z.object({
    JAVASCRIPT: z.string().optional(),
    PYTHON: z.string().optional(),
    JAVA: z.string().optional(),
  }).optional(),
  referenceSolutions: z.object({
    JAVASCRIPT: z.string().min(1, "JavaScript solution is required"),
    PYTHON: z.string().min(1, "Python solution is required"),
    JAVA: z.string().min(1, "Java solution is required"),
  }),
});

/* ================= SAMPLE DATA ================= */

const sampleAddTwoNumbers = {
  title: "Add Two Numbers",
  description: "You are given two integers a and b. Your task is to calculate and print the sum of the two numbers.",
  difficulty: "EASY",
  tags: ["Math", "Beginner"],
  constraints: "-10^9 <= a, b <= 10^9",
  hints: "Simply add the two numbers and return the result.",
  editorial: "This is a basic addition problem. Read two integers from input and return their sum.",
  testCases: [
    { input: "5 7", output: "12" },
    { input: "10 20", output: "30" },
    { input: "3 9", output: "12" },
    { input: "-5 5", output: "0" },
    { input: "0 0", output: "0" },
  ],
  examples: {
    JAVASCRIPT: { input: "5 7", output: "12", explanation: "5 + 7 = 12" },
    PYTHON: { input: "10 20", output: "30", explanation: "10 + 20 = 30" },
    JAVA: { input: "3 9", output: "12", explanation: "3 + 9 = 12" },
  },
  codeSnippets: {
    JAVASCRIPT: `function addTwoNumbers(a, b) {\n  // Write your code here\n\n}`,
    PYTHON: `def add_two_numbers(a, b):\n    # Write your code here\n    pass`,
    JAVA: `public static int addTwoNumbers(int a, int b) {\n    // Write your code here\n    return 0;\n}`,
  },
  codeWrappers: {
    JAVASCRIPT: `{{USER_CODE}}\n\nconst fs = require("fs");\nconst input = fs.readFileSync(0, "utf-8").trim();\nconst [a, b] = input.split(" ").map(Number);\nconst result = addTwoNumbers(a, b);\nif (typeof result !== "undefined") {\n  console.log(result);\n}`,
    PYTHON: `{{USER_CODE}}\n\nimport sys\ndata = sys.stdin.read().split()\na, b = int(data[0]), int(data[1])\nprint(add_two_numbers(a, b))`,
    JAVA: `import java.util.Scanner;\npublic class Main {\n  {{USER_CODE}}\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    int a = sc.nextInt();\n    int b = sc.nextInt();\n    System.out.println(addTwoNumbers(a, b));\n  }\n}`,
  },
  referenceSolutions: {
    JAVASCRIPT: `function addTwoNumbers(a, b) {\n  return a + b;\n}\n\nconst fs = require("fs");\nconst input = fs.readFileSync(0, "utf-8").trim();\nconst [a, b] = input.split(" ").map(Number);\nconsole.log(addTwoNumbers(a, b));`,
    PYTHON: `def add_two_numbers(a, b):\n    return a + b\n\nimport sys\ndata = sys.stdin.read().split()\na, b = int(data[0]), int(data[1])\nprint(add_two_numbers(a, b))`,
    JAVA: `import java.util.Scanner;\npublic class Main {\n  public static int addTwoNumbers(int a, int b) {\n    return a + b;\n  }\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    int a = sc.nextInt();\n    int b = sc.nextInt();\n    System.out.println(addTwoNumbers(a, b));\n  }\n}`,
  },
};

const sampledpData = {
  title: "Climbing Stairs",
  description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
  difficulty: "EASY",
  tags: ["Dynamic Programming", "Math", "Memoization"],
  constraints: "1 <= n <= 45",
  hints: "To reach the nth step, you can either come from the (n-1)th step or the (n-2)th step.",
  editorial: "This is a classic dynamic programming problem.",
  testCases: [
    { input: "2", output: "2" },
    { input: "3", output: "3" },
    { input: "4", output: "5" },
  ],
  examples: {
    JAVASCRIPT: { input: "n = 2", output: "2", explanation: "Two ways: 1+1 or 2" },
    PYTHON: { input: "n = 3", output: "3", explanation: "Three ways: 1+1+1, 1+2, 2+1" },
    JAVA: { input: "n = 4", output: "5", explanation: "Five ways to climb 4 steps" },
  },
  codeSnippets: {
    JAVASCRIPT: `function climbStairs(n) {\n  // Write your code here\n}`,
    PYTHON: `def climb_stairs(n):\n    # Write your code here\n    pass`,
    JAVA: `public static int climbStairs(int n) {\n    // Write your code here\n    return 0;\n}`,
  },
  codeWrappers: {
    JAVASCRIPT: `{{USER_CODE}}\n\nconst fs = require("fs");\nconst input = fs.readFileSync(0, "utf-8").trim();\nconst n = parseInt(input);\nconst result = climbStairs(n);\nif (typeof result !== "undefined") {\n  console.log(result);\n}`,
    PYTHON: `{{USER_CODE}}\n\nimport sys\nn = int(sys.stdin.read().strip())\nprint(climb_stairs(n))`,
    JAVA: `import java.util.Scanner;\npublic class Main {\n  {{USER_CODE}}\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    int n = Integer.parseInt(sc.nextLine().trim());\n    Main m = new Main();\n    System.out.println(m.climbStairs(n));\n  }\n}`,
  },
  referenceSolutions: {
    JAVASCRIPT: `function climbStairs(n) {\n  if (n <= 2) return n;\n  let a = 1, b = 2;\n  for (let i = 3; i <= n; i++) { let t = a + b; a = b; b = t; }\n  return b;\n}\n\nconst fs = require("fs");\nconst input = fs.readFileSync(0, "utf-8").trim();\nconsole.log(climbStairs(parseInt(input)));`,
    PYTHON: `def climb_stairs(n):\n    if n <= 2: return n\n    a, b = 1, 2\n    for _ in range(3, n+1): a, b = b, a+b\n    return b\nimport sys\nprint(climb_stairs(int(sys.stdin.read().strip())))`,
    JAVA: `import java.util.Scanner;\npublic class Main {\n  public static int climbStairs(int n) {\n    if (n <= 2) return n;\n    int a=1,b=2;\n    for(int i=3;i<=n;i++){int t=a+b;a=b;b=t;}\n    return b;\n  }\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    System.out.println(climbStairs(Integer.parseInt(sc.nextLine().trim())));\n  }\n}`,
  },
};

const sampleStringProblem = {
  title: "Valid Palindrome",
  description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string s, return true if it is a palindrome, or false otherwise.",
  difficulty: "EASY",
  tags: ["String", "Two Pointers"],
  constraints: "1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.",
  hints: "Consider using two pointers, one from the start and one from the end.",
  editorial: "Use two pointers approach to check if the string is a palindrome.",
  testCases: [
    { input: "A man, a plan, a canal: Panama", output: "true" },
    { input: "race a car", output: "false" },
    { input: " ", output: "true" },
  ],
  examples: {
    JAVASCRIPT: { input: 's = "A man, a plan, a canal: Panama"', output: "true", explanation: '"amanaplanacanalpanama" is a palindrome.' },
    PYTHON: { input: 's = "A man, a plan, a canal: Panama"', output: "true", explanation: '"amanaplanacanalpanama" is a palindrome.' },
    JAVA: { input: 's = "A man, a plan, a canal: Panama"', output: "true", explanation: '"amanaplanacanalpanama" is a palindrome.' },
  },
  codeSnippets: {
    JAVASCRIPT: `function isPalindrome(s) {\n  // Write your code here\n}`,
    PYTHON: `def is_palindrome(s):\n    # Write your code here\n    pass`,
    JAVA: `public static boolean isPalindrome(String s) {\n    // Write your code here\n    return false;\n}`,
  },
  codeWrappers: {
    JAVASCRIPT: `{{USER_CODE}}\n\nconst fs = require("fs");\nconst input = fs.readFileSync(0, "utf-8").trim();\nconst result = isPalindrome(input);\nconsole.log(result ? "true" : "false");`,
    PYTHON: `{{USER_CODE}}\n\nimport sys\ns = sys.stdin.read().strip()\nprint(str(is_palindrome(s)).lower())`,
    JAVA: `import java.util.Scanner;\npublic class Main {\n  {{USER_CODE}}\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    String input = sc.nextLine();\n    System.out.println(isPalindrome(input) ? "true" : "false");\n  }\n}`,
  },
  referenceSolutions: {
    JAVASCRIPT: `function isPalindrome(s) {\n  s = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return s === s.split('').reverse().join('');\n}\nconst fs = require("fs");\nconst input = fs.readFileSync(0, "utf-8").trim();\nconsole.log(isPalindrome(input) ? "true" : "false");`,
    PYTHON: `def is_palindrome(s):\n    s = ''.join(c.lower() for c in s if c.isalnum())\n    return s == s[::-1]\nimport sys\ns = sys.stdin.read().strip()\nprint(str(is_palindrome(s)).lower())`,
    JAVA: `import java.util.Scanner;\npublic class Main {\n  public static boolean isPalindrome(String s) {\n    s = s.replaceAll("[^a-zA-Z0-9]","").toLowerCase();\n    int l=0,r=s.length()-1;\n    while(l<r){if(s.charAt(l)!=s.charAt(r))return false;l++;r--;}\n    return true;\n  }\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    System.out.println(isPalindrome(sc.nextLine())?"true":"false");\n  }\n}`,
  },
};

/* ================= COMPONENT ================= */
const CreateProblemForm = ({ editData }) => {
  const [sampleType, setSampleType] = useState("ADD");
  const navigation = useNavigate();

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      testCases: [{ input: "", output: "" }],
      tags: [""],
      examples: {
        JAVASCRIPT: { input: "", output: "", explanation: "" },
        PYTHON: { input: "", output: "", explanation: "" },
        JAVA: { input: "", output: "", explanation: "" },
      },
      codeSnippets: {
        JAVASCRIPT: "function solution() {\n  // Write your code here\n}",
        PYTHON: "def solution():\n    # Write your code here\n    pass",
        JAVA: "public static void solution() {\n    // Write your code here\n}",
      },
      codeWrappers: {
        JAVASCRIPT: "{{USER_CODE}}\n\n// Add input parsing here",
        PYTHON: "{{USER_CODE}}\n\n# Add input parsing here",
        JAVA: "public class Main {\n  {{USER_CODE}}\n  public static void main(String[] args) {\n    // Add input parsing here\n  }\n}",
      },
      referenceSolutions: {
        JAVASCRIPT: "// Add your reference solution here",
        PYTHON: "# Add your reference solution here",
        JAVA: "// Add your reference solution here",
      },
    }
  });

  useEffect(() => {
    if (editData) {
      const mappedExamples =
        editData.examples && editData.examples.length > 0
          ? {
              JAVASCRIPT: editData.examples[0] || { input: "", output: "", explanation: "" },
              PYTHON: editData.examples[1] || { input: "", output: "", explanation: "" },
              JAVA: editData.examples[2] || { input: "", output: "", explanation: "" },
            }
          : {
              JAVASCRIPT: { input: "", output: "", explanation: "" },
              PYTHON: { input: "", output: "", explanation: "" },
              JAVA: { input: "", output: "", explanation: "" },
            };

      reset({
        ...editData,
        constraints: editData.constraints?.[0] || "",
        hints: editData.hints?.[0] || "",
        examples: mappedExamples,
        codeSnippets: editData.codeSnippets?.[0] || {},
        codeWrappers: editData.codeWrappers?.[0] || {},
        referenceSolutions: editData.referenceSolutions?.[0] || {},
        testCases: editData.testCases || [],
        tags: editData.tags || [],
      });

      replacetestCases(editData.testCases || []);
      replaceTags(editData.tags || []);
    }
  }, [editData]);

  const { fields: testCaseFields, append: appendTestCase, remove: removeTestCase, replace: replacetestCases } = useFieldArray({ control, name: "testCases" });
  const { fields: tagFields, append: appendTag, remove: removeTag, replace: replaceTags } = useFieldArray({ control, name: "tags" });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (value) => {
    try {
      setIsLoading(true);
      const formattedExamples = Object.values(value.examples || {}).filter(ex => ex.input && ex.output);
      const payload = { ...value, examples: formattedExamples };

      if (editData) {
        await axiosInstance.put(`/problems/updateproblem/${editData._id}`, payload);
        toast.success("Problem updated successfully");
      } else {
        await axiosInstance.post("/problems/create-problem", payload);
        toast.success("Problem created successfully");
      }
      navigation("/");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleData = () => {
    let sampleData;
    if (sampleType === "ADD") sampleData = sampleAddTwoNumbers;
    else if (sampleType === "DP") sampleData = sampledpData;
    else sampleData = sampleStringProblem;

    replaceTags(sampleData.tags.map(tag => tag));
    replacetestCases(sampleData.testCases.map(tc => tc));
    reset(sampleData);
  };

  return (
    <div className='container mx-auto py-8 px-4 max-w-7xl'>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-6 md:p-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 border-b">
            <h2 className="card-title text-2xl md:text-3xl flex items-center gap-3">
              <FileText className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              Create Problem
            </h2>
            <div className="flex flex-col md:flex-row gap-3 mt-4 md:mt-0">
              <div className="join">
                <button type="button" className={`btn join-item btn-sm ${sampleType === "ADD" ? "btn-active" : ""}`} onClick={() => setSampleType("ADD")}>Add Two Numbers</button>
                <button type="button" className={`btn join-item btn-sm ${sampleType === "DP" ? "btn-active" : ""}`} onClick={() => setSampleType("DP")}>DP Problem</button>
                <button type="button" className={`btn join-item btn-sm ${sampleType === "STRING" ? "btn-active" : ""}`} onClick={() => setSampleType("STRING")}>String Problem</button>
              </div>
              <button type="button" className="btn btn-secondary btn-sm gap-2" onClick={loadSampleData}>
                <Download className="w-4 h-4" />Load Sample
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control md:col-span-2">
                <label className="label"><span className="label-text text-base md:text-lg font-semibold">Title</span></label>
                <input type="text" className="input input-bordered w-full text-base md:text-lg" {...register("title")} placeholder="Enter problem title" />
                {errors.title && <label className="label"><span className="label-text-alt text-error">{errors.title.message}</span></label>}
              </div>

              <div className="form-control md:col-span-2">
                <label className="label"><span className="label-text text-base md:text-lg font-semibold">Description</span></label>
                <textarea className="textarea textarea-bordered min-h-32 w-full text-base md:text-lg p-4 resize-y" {...register("description")} placeholder="Enter problem description" />
                {errors.description && <label className="label"><span className="label-text-alt text-error">{errors.description.message}</span></label>}
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text text-base md:text-lg font-semibold">Difficulty</span></label>
                <select className="select select-bordered w-full text-base md:text-lg" {...register("difficulty")}>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="card bg-base-200 p-4 md:p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2"><BookOpen className="w-5 h-5" />Tags</h3>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => appendTag("")}><Plus className="w-4 h-4 mr-1" />Add Tag</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tagFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <input type="text" className="input input-bordered flex-1" {...register(`tags.${index}`)} placeholder="Enter tag" />
                    <button type="button" className="btn btn-ghost btn-square btn-sm" onClick={() => removeTag(index)} disabled={tagFields.length === 1}>
                      <Trash2 className="w-4 h-4 text-error" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Cases */}
            <div className="card bg-base-200 p-4 md:p-6 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2"><CheckCircle2 className="w-5 h-5" />Test Cases</h3>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => appendTestCase({ input: "", output: "" })}><Plus className="w-4 h-4 mr-1" />Add Test Case</button>
              </div>
              <div className="space-y-6">
                {testCaseFields.map((field, index) => (
                  <div key={field.id} className="card bg-base-100 shadow-md">
                    <div className="card-body p-4 md:p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-base md:text-lg font-semibold">Test Case #{index + 1}</h4>
                        <button type="button" className="btn btn-ghost btn-sm text-error" onClick={() => removeTestCase(index)} disabled={testCaseFields.length === 1}>
                          <Trash2 className="w-4 h-4 mr-1" />Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="form-control">
                          <label className="label"><span className="label-text font-medium">Input</span></label>
                          <textarea className="textarea textarea-bordered min-h-24 w-full p-3 resize-y" {...register(`testCases.${index}.input`)} placeholder="Enter test case input" />
                          {errors.testCases?.[index]?.input && <label className="label"><span className="label-text-alt text-error">{errors.testCases[index].input.message}</span></label>}
                        </div>
                        <div className="form-control">
                          <label className="label"><span className="label-text font-medium">Expected Output</span></label>
                          <textarea className="textarea textarea-bordered min-h-24 w-full p-3 resize-y" {...register(`testCases.${index}.output`)} placeholder="Enter expected output" />
                          {errors.testCases?.[index]?.output && <label className="label"><span className="label-text-alt text-error">{errors.testCases[index].output.message}</span></label>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Sections per Language */}
            <div className="space-y-8">
              {["JAVASCRIPT", "PYTHON", "JAVA"].map((language) => (
                <div key={language} className="card bg-base-200 p-4 md:p-6 shadow-md">
                  <h3 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2">
                    <Code2 className="w-5 h-5" />{language}
                  </h3>
                  <div className="space-y-6">

                    {/* Starter Code */}
                    <div className="card bg-base-100 shadow-md">
                      <div className="card-body p-4 md:p-6">
                        <h4 className="font-semibold text-base md:text-lg mb-1">Starter Code Template</h4>
                        <p className="text-sm text-warning mb-4">⚠️ Sirf function template likho — input/output parsing mat likho</p>
                        <div className="border rounded-md overflow-hidden">
                          <Controller
                            name={`codeSnippets.${language}`}
                            control={control}
                            render={({ field }) => (
                              <Editor height="200px" language={language.toLowerCase()} theme="vs-dark"
                                value={field.value} onChange={field.onChange}
                                options={{ minimap: { enabled: false }, fontSize: 14, lineNumbers: "on", scrollBeyondLastLine: false, automaticLayout: true }} />
                            )}
                          />
                        </div>
                        {errors.codeSnippets?.[language] && <div className="mt-2"><span className="text-error text-sm">{errors.codeSnippets[language].message}</span></div>}
                      </div>
                    </div>

                    {/* Code Wrapper — Hidden from user */}
                    <div className="card bg-base-100 shadow-md border border-warning/30">
                      <div className="card-body p-4 md:p-6">
                        <h4 className="font-semibold text-base md:text-lg mb-1 flex items-center gap-2">
                          <span className="text-warning">🔒</span> Code Wrapper
                          <span className="badge badge-warning badge-sm">Hidden from user</span>
                        </h4>
                        <p className="text-sm text-zinc-400 mb-4">
                          Yahan input parsing aur output print karo. <code className="bg-base-300 px-1 rounded">{"{{USER_CODE}}"}</code> ki jagah user ka function inject hoga.
                        </p>
                        <div className="border border-warning/30 rounded-md overflow-hidden">
                          <Controller
                            name={`codeWrappers.${language}`}
                            control={control}
                            render={({ field }) => (
                              <Editor height="200px" language={language.toLowerCase()} theme="vs-dark"
                                value={field.value} onChange={field.onChange}
                                options={{ minimap: { enabled: false }, fontSize: 14, lineNumbers: "on", scrollBeyondLastLine: false, automaticLayout: true }} />
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Reference Solution */}
                    <div className="card bg-base-100 shadow-md">
                      <div className="card-body p-4 md:p-6">
                        <h4 className="font-semibold text-base md:text-lg mb-4 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-success" />Reference Solution
                        </h4>
                        <div className="border rounded-md overflow-hidden">
                          <Controller
                            name={`referenceSolutions.${language}`}
                            control={control}
                            render={({ field }) => (
                              <Editor height="300px" language={language.toLowerCase()} theme="vs-dark"
                                value={field.value} onChange={field.onChange}
                                options={{ minimap: { enabled: false }, fontSize: 14, lineNumbers: "on", scrollBeyondLastLine: false, automaticLayout: true }} />
                            )}
                          />
                        </div>
                        {errors.referenceSolutions?.[language] && <div className="mt-2"><span className="text-error text-sm">{errors.referenceSolutions[language].message}</span></div>}
                      </div>
                    </div>

                    {/* Examples */}
                    <div className="card bg-base-100 shadow-md">
                      <div className="card-body p-4 md:p-6">
                        <h4 className="font-semibold text-base md:text-lg mb-4">Example</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Input</span></label>
                            <textarea className="textarea textarea-bordered min-h-20 w-full p-3 resize-y" {...register(`examples.${language}.input`)} placeholder="Example input" />
                            {errors.examples?.[language]?.input && <label className="label"><span className="label-text-alt text-error">{errors.examples[language].input.message}</span></label>}
                          </div>
                          <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Output</span></label>
                            <textarea className="textarea textarea-bordered min-h-20 w-full p-3 resize-y" {...register(`examples.${language}.output`)} placeholder="Example output" />
                            {errors.examples?.[language]?.output && <label className="label"><span className="label-text-alt text-error">{errors.examples[language].output.message}</span></label>}
                          </div>
                          <div className="form-control md:col-span-2">
                            <label className="label"><span className="label-text font-medium">Explanation</span></label>
                            <textarea className="textarea textarea-bordered min-h-24 w-full p-3 resize-y" {...register(`examples.${language}.explanation`)} placeholder="Explain the example" />
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="card bg-base-200 p-4 md:p-6 shadow-md">
              <h3 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-warning" />Additional Information
              </h3>
              <div className="space-y-6">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Constraints</span></label>
                  <textarea className="textarea textarea-bordered min-h-24 w-full p-3 resize-y" {...register("constraints")} placeholder="Enter problem constraints" />
                  {errors.constraints && <label className="label"><span className="label-text-alt text-error">{errors.constraints.message}</span></label>}
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Hints (Optional)</span></label>
                  <textarea className="textarea textarea-bordered min-h-24 w-full p-3 resize-y" {...register("hints")} placeholder="Enter hints for solving the problem" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Editorial (Optional)</span></label>
                  <textarea className="textarea textarea-bordered min-h-32 w-full p-3 resize-y" {...register("editorial")} placeholder="Enter problem editorial" />
                </div>
              </div>
            </div>

            <div className="card-actions justify-end pt-4 border-t">
              <button type="submit" className="btn btn-primary btn-lg gap-2">
                {isLoading ? (
                  <span className="loading loading-spinner text-white"></span>
                ) : (
                  <><CheckCircle2 className="w-5 h-5" />{editData ? "Update Problem" : "Create Problem"}</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProblemForm;