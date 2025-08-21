import { useState, useEffect, useCallback } from "react";
import { Button } from "./components/ui/button";

interface ArrayElement {
  value: number;
  id: number;
  isComparing: boolean;
  isSwapping: boolean;
  isSorted: boolean;
}

interface SortStep {
  array: ArrayElement[];
  comparing: [number, number] | null;
  swapping: [number, number] | null;
  sortedIndex: number;
}

function App() {
  const [array, setArray] = useState<ArrayElement[]>([]);
  const [sortSteps, setSortSteps] = useState<SortStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [arraySize] = useState(12);

  // Generate random array
  const generateRandomArray = useCallback(() => {
    const newArray: ArrayElement[] = [];
    for (let i = 0; i < arraySize; i++) {
      newArray.push({
        value: Math.floor(Math.random() * 300) + 10,
        id: i,
        isComparing: false,
        isSwapping: false,
        isSorted: false,
      });
    }
    setArray(newArray);
    setSortSteps([]);
    setCurrentStep(-1);
    setIsAnimating(false);
  }, [arraySize]);

  // Generate Bubble Sort steps
  const generateBubbleSortSteps = useCallback((arr: ArrayElement[]): SortStep[] => {
    const steps: SortStep[] = [];
    const workingArray = [...arr];
    const n = workingArray.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Step 1: Compare elements
        const compareArray = workingArray.map((elem, index) => ({
          ...elem,
          isComparing: index === j || index === j + 1,
          isSwapping: false,
          isSorted: index >= n - i,
        }));

        steps.push({
          array: [...compareArray],
          comparing: [j, j + 1],
          swapping: null,
          sortedIndex: n - i - 1,
        });

        // Step 2: Swap if needed
        if (workingArray[j].value > workingArray[j + 1].value) {
          // Create swap animation step
          const swapArray = workingArray.map((elem, index) => ({
            ...elem,
            isComparing: false,
            isSwapping: index === j || index === j + 1,
            isSorted: index >= n - i,
          }));

          steps.push({
            array: [...swapArray],
            comparing: null,
            swapping: [j, j + 1],
            sortedIndex: n - i - 1,
          });

          // Perform the actual swap
          [workingArray[j], workingArray[j + 1]] = [workingArray[j + 1], workingArray[j]];
        }

        // Step 3: Reset highlighting
        const resetArray = workingArray.map((elem, index) => ({
          ...elem,
          isComparing: false,
          isSwapping: false,
          isSorted: index >= n - i,
        }));

        steps.push({
          array: [...resetArray],
          comparing: null,
          swapping: null,
          sortedIndex: n - i - 1,
        });
      }
    }

    // Final step - mark all as sorted
    const finalArray = workingArray.map(elem => ({
      ...elem,
      isComparing: false,
      isSwapping: false,
      isSorted: true,
    }));

    steps.push({
      array: [...finalArray],
      comparing: null,
      swapping: null,
      sortedIndex: -1,
    });

    return steps;
  }, []);

  // Start sorting animation
  const startSort = useCallback(() => {
    if (array.length === 0 || isAnimating) return;

    const steps = generateBubbleSortSteps(array);
    setSortSteps(steps);
    setCurrentStep(0);
    setIsAnimating(true);
  }, [array, isAnimating, generateBubbleSortSteps]);

  // Auto-advance animation
  useEffect(() => {
    if (isAnimating && currentStep >= 0 && currentStep < sortSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 800);

      return () => clearTimeout(timer);
    } else if (currentStep >= sortSteps.length - 1 && sortSteps.length > 0) {
      setIsAnimating(false);
    }
  }, [currentStep, sortSteps.length, isAnimating]);

  // Update array display based on current step
  useEffect(() => {
    if (currentStep >= 0 && currentStep < sortSteps.length) {
      setArray(sortSteps[currentStep].array);
    }
  }, [currentStep, sortSteps]);

  // Initialize with random array
  useEffect(() => {
    generateRandomArray();
  }, [generateRandomArray]);

  const maxHeight = array.length > 0 ? Math.max(...array.map(item => item.value)) : 300;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bubble Sort Visualizer
          </h1>
          <p className="text-gray-600 text-lg">
            Watch how Bubble Sort compares and swaps elements step by step
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-12">
          <Button
            onClick={generateRandomArray}
            disabled={isAnimating}
            variant="outline"
            className="px-6"
          >
            Generate New Array
          </Button>
          <Button
            onClick={startSort}
            disabled={isAnimating || array.length === 0}
            className="px-8"
          >
            {isAnimating ? "Sorting..." : "Start Bubble Sort"}
          </Button>
        </div>

        {/* Algorithm Info */}
        {currentStep >= 0 && sortSteps.length > 0 && (
          <div className="text-center mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm inline-block">
              <p className="text-sm text-gray-600">
                Step {currentStep + 1} of {sortSteps.length}
              </p>
              {sortSteps[currentStep].comparing && (
                <p className="text-sm text-blue-600 font-medium">
                  Comparing elements at positions {sortSteps[currentStep].comparing![0]} and {sortSteps[currentStep].comparing![1]}
                </p>
              )}
              {sortSteps[currentStep].swapping && (
                <p className="text-sm text-red-600 font-medium">
                  Swapping elements at positions {sortSteps[currentStep].swapping![0]} and {sortSteps[currentStep].swapping![1]}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Visualization */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-end justify-center gap-1 h-80">
            {array.map((item, index) => {
              const height = (item.value / maxHeight) * 280;
              let bgColor = "bg-blue-500";
              
              if (item.isSorted) {
                bgColor = "bg-green-500";
              } else if (item.isSwapping) {
                bgColor = "bg-red-500";
              } else if (item.isComparing) {
                bgColor = "bg-yellow-500";
              }

              return (
                <div key={`${item.id}-${index}`} className="flex flex-col items-center gap-2">
                  <div
                    className={`${bgColor} rounded-t-md transition-all duration-300 ease-in-out flex items-end justify-center pb-2 ${
                      item.isSwapping ? "scale-110 shadow-lg" : ""
                    }`}
                    style={{
                      height: `${height}px`,
                      width: "48px",
                      minHeight: "20px",
                    }}
                  >
                    <span className="text-white text-xs font-semibold">
                      {item.value}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{index}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-700">Unsorted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-700">Comparing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-700">Swapping</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-700">Sorted</span>
            </div>
          </div>
        </div>

        {/* Algorithm Explanation */}
        <div className="bg-white rounded-lg p-6 shadow-sm mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How Bubble Sort Works</h3>
          <div className="text-gray-700 space-y-2">
            <p>1. <strong>Compare</strong> adjacent elements in the array</p>
            <p>2. <strong>Swap</strong> them if they are in the wrong order (left {'>'} right)</p>
            <p>3. <strong>Repeat</strong> for each pair of adjacent elements</p>
            <p>4. After each complete pass, the largest element "bubbles" to its correct position</p>
            <p>5. <strong>Continue</strong> until no more swaps are needed</p>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Time Complexity:</strong> O(n²) {' | '} <strong>Space Complexity:</strong> O(1)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
