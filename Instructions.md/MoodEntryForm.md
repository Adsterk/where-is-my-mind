# MoodEntry Form Feature Enhancement Brief

## 1.0 Core Form Structure

### 1.1 Fixed Sections

#### 1.1.1 Mood Tracking
- Simple mood selection interface
- Optional notes field
- Time stamp

#### 1.1.2 Sleep Tracking
- Sliding scale for hours (0-24)
- Numeric input alternative for accessibility
- Sleep quality rating (optional)

### 1.2 Customizable Sections
Each section below supports:
- Multi-selection of items
- Custom item addition/deletion
- Item reordering within section

#### 1.2.1 Medication Tracking
- Track multiple medications
- Per medication:
  - Name and dosage
  - Time taken
  - Notes/side effects

#### 1.2.2 Activity & Hobbies
- Track multiple activities
- Per activity:
  - Duration
  - Engagement level
  - Impact on mood

#### 1.2.3 Social Connections
- Track multiple interactions
- Per interaction:
  - Type of connection
  - Quality rating
  - Impact on wellbeing

#### 1.2.4 Problematic Behaviors
- Track multiple behaviors
- Per behavior:
  - Intensity scale
  - Frequency scale
  - Triggers/notes

#### 1.2.5 Skills
- Track skills used
- Per skill:
  - Effectiveness scale 1-5
    - 1: Thought about, not used, didn't want to
    - 2: Thought about, not used, wanted to
    - 3: Tried but couldn't use them
    - 4: Tried, could use them but they didn't help
    - 5: Tried, could use them, they helped

#### 1.2.6 Faith & Spirituality
- Track multiple activities
- Per activity:
  - Type of practice
  - Duration
  - Impact rating

## 2.0 Form Customization

### 2.1 Section Management

#### 2.1.1 Reordering
- Drag-and-drop functionality
- Keyboard-accessible arrows
- Visual feedback during moves

#### 2.1.2 Section Controls
- Add new sections
- Delete existing sections
- Rename sections
- Collapse/expand sections

#### 2.1.3 Template System
- Save section templates
- Load from templates
- Share templates (future)

### 2.2 Item Management

#### 2.2.1 Within Sections
- Add custom items
- Delete items
- Multi-select items
- Expand/collapse item details

## 3.0 Technical Implementation

### 3.1 Data Architecture
- Flexible schema for custom sections
- Historical data preservation
- Cross-device sync
- User preferences storage

### 3.2 UI/UX Standards
- shadcn/ui components
- Responsive design
- Clear visual hierarchy
- Consistent interactions

### 3.3 Accessibility
- WCAG compliance
- Keyboard navigation
- Screen reader support
- Multi-input methods

### 3.4 Performance
- Optimized loading
- Efficient state management
- Robust error handling
- Data validation

## 4.0 

### 4.1 Instruction for Creating New Sections
1. Component Setup:
Create a new component for the section.
Define interfaces for the main item and entry types.

2. State Management:
Use useState to manage items and entries.
Implement useEffect to load existing items from the database.

3. Add New Item:
Provide a form to add new items.
Insert new items into the database and update the state.

4. Toggle Entry:
Allow users to toggle entries for each item.
Update the state to reflect the current entries.

5. Update Entry:
Provide input fields to update entry details.
Update the state with changes.
6. UI Design:
Use cards to display each item.
Include buttons to add new items and toggle entries.
Ensure the UI is responsive and accessible.

7. Database Integration:
Use Supabase to fetch and update data.
Ensure proper error handling and loading states.