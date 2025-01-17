'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAccessibility } from '@/components/providers/AccessibilityProvider'

export function AccessibilitySettings() {
  const { settings, updateSettings } = useAccessibility()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accessibility Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Text Size</Label>
          <Select
            value={settings.fontSize}
            onValueChange={(value) => 
              updateSettings({ fontSize: value as 'normal' | 'large' | 'x-large' })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select text size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="large">Large</SelectItem>
              <SelectItem value="x-large">Extra Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Color Blind Mode</Label>
          <Select
            value={settings.colorBlindMode}
            onValueChange={(value) => 
              updateSettings({ 
                colorBlindMode: value as 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' 
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select color blind mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="protanopia">Protanopia</SelectItem>
              <SelectItem value="deuteranopia">Deuteranopia</SelectItem>
              <SelectItem value="tritanopia">Tritanopia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label>High Contrast</Label>
          <Switch
            checked={settings.highContrast}
            onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Reduced Motion</Label>
          <Switch
            checked={settings.reducedMotion}
            onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
          />
        </div>
      </CardContent>
    </Card>
  )
} 