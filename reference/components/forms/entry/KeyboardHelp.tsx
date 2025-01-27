export function KeyboardHelp() {
  return (
    <div className="text-sm text-muted-foreground mt-4">
      <h4 className="font-medium">Keyboard Shortcuts:</h4>
      <ul className="list-disc list-inside">
        <li>Up/Down Arrow: Navigate sections</li>
        <li>E: Toggle edit mode</li>
        <li>Enter: Select/deselect items</li>
        <li>Delete: Remove selected item (in edit mode)</li>
      </ul>
    </div>
  )
} 