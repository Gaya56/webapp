import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTools } from "@/hooks/use-tools";

/**
 * Tool Selector component - allows users to select which tools to enable
 */
export function ToolSelector({ className = "" }) {
  const { availableTools, isToolSelected, toggleTool, hasToolsSelected } = useTools();

  if (availableTools.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground">Tools:</span>
      
      {availableTools.map((tool) => (
        <div key={tool.toolId} className="flex items-center space-x-2">
          <Checkbox
            id={`tool-${tool.toolId}`}
            checked={isToolSelected(tool.toolId)}
            onCheckedChange={() => toggleTool(tool.toolId)}
            className="h-4 w-4"
          />
          <Label
            htmlFor={`tool-${tool.toolId}`}
            className="flex items-center space-x-2 text-sm font-medium cursor-pointer"
          >
            <img
              src={tool.icon}
              alt={tool.name}
              className="w-4 h-4 rounded"
            />
            <span>{tool.name}</span>
          </Label>
        </div>
      ))}
      
      {hasToolsSelected && (
        <Badge variant="secondary" className="text-xs">
          {availableTools.filter(tool => isToolSelected(tool.toolId)).length} selected
        </Badge>
      )}
    </div>
  );
}

/**
 * Compact tool selector for smaller spaces
 */
export function CompactToolSelector({ className = "" }) {
  const { availableTools, isToolSelected, toggleTool, hasToolsSelected } = useTools();

  if (availableTools.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {availableTools.map((tool) => (
        <div
          key={tool.toolId}
          className={`flex items-center space-x-1 px-2 py-1 rounded cursor-pointer transition-colors ${
            isToolSelected(tool.toolId)
              ? "bg-primary/10 border border-primary/20"
              : "bg-muted/50 hover:bg-muted/80"
          }`}
          onClick={() => toggleTool(tool.toolId)}
          title={tool.description}
        >
          <Checkbox
            id={`compact-tool-${tool.toolId}`}
            checked={isToolSelected(tool.toolId)}
            className="h-3 w-3"
            tabIndex={-1}
          />
          <img
            src={tool.icon}
            alt={tool.name}
            className="w-3 h-3 rounded"
          />
          <span className="text-xs font-medium">{tool.name}</span>
        </div>
      ))}
    </div>
  );
}