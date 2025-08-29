import { useAtom } from "jotai";
import { selectedToolsAtom, AVAILABLE_TOOLS, getEnabledTools, getToolsAsOpenAIFunctions } from "@/config/tools";

/**
 * Hook for managing tool selection and state
 */
export function useTools() {
  const [selectedTools, setSelectedTools] = useAtom(selectedToolsAtom);

  const toggleTool = (toolId) => {
    setSelectedTools(current => {
      if (current.includes(toolId)) {
        return current.filter(id => id !== toolId);
      } else {
        return [...current, toolId];
      }
    });
  };

  const enableTool = (toolId) => {
    setSelectedTools(current => {
      if (!current.includes(toolId)) {
        return [...current, toolId];
      }
      return current;
    });
  };

  const disableTool = (toolId) => {
    setSelectedTools(current => current.filter(id => id !== toolId));
  };

  const clearAllTools = () => {
    setSelectedTools([]);
  };

  const isToolSelected = (toolId) => {
    return selectedTools.includes(toolId);
  };

  const getSelectedToolsData = () => {
    return getEnabledTools(selectedTools);
  };

  const getToolsForAPI = () => {
    return getToolsAsOpenAIFunctions(selectedTools);
  };

  return {
    availableTools: AVAILABLE_TOOLS,
    selectedTools,
    setSelectedTools,
    toggleTool,
    enableTool,
    disableTool,
    clearAllTools,
    isToolSelected,
    getSelectedToolsData,
    getToolsForAPI,
    hasToolsSelected: selectedTools.length > 0
  };
}