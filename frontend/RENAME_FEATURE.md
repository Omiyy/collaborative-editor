# ✨ Document Rename Feature - Implementation Guide

## 🎯 How It Works

When you hover over a document in the left sidebar, an **Edit button (pencil icon)** appears. Click it to rename the document.

### User Flow:
1. Hover over any document in the left sidebar
2. An **Edit icon (pencil)** appears on the right
3. Click the edit icon to open the rename modal
4. Type the new name
5. Click "Rename" or press Enter to save
6. Click "Cancel" or press Escape to discard changes

---

## 📁 Files Modified/Created

### ✅ New Component Created
**`src/components/RenameModal.jsx`** (99 lines)
- Modal dialog for renaming documents
- Input field with autocomplete
- Cancel and Rename buttons
- Validates that name is not empty
- Prevents rename if name hasn't changed

### ✅ Updated Components

**`src/components/DocumentList.jsx`**
- Added pencil icon (Edit2) from lucide-react
- Added edit button that appears on document hover
- Button triggers `onEditDoc` callback
- Uses `group-hover:opacity-100` for smooth reveal
- Responsive button styling based on selection state

**`src/pages/EditorPage.jsx`**
- Imported RenameModal component
- Added 4 new state variables:
  - `showRenameModal` - toggle modal visibility
  - `renamingDocId` - track which doc is being renamed
  - `renamingDocName` - store current doc name
- Added 2 new handler functions:
  - `handleEditDoc()` - opens rename modal
  - `handleRenameDocument()` - saves new name
- Passes `onEditDoc` to DocumentList component
- Renders RenameModal at the bottom

### ✅ Updated Services

**`src/services/apiService.js`**
- Added new function: `renameDocument(docId, newName)`
- Placeholder ready for backend integration
- Logs all rename operations

---

## 🔧 Code Changes Summary

### DocumentList.jsx
```javascript
// Added import
import { Edit2 } from 'lucide-react';

// Added prop
onEditDoc

// Updated structure - added edit button
<div className="flex items-center gap-2">
  <button onClick={...}>Document Name</button>
  <button onClick={() => onEditDoc(doc.id, doc.name)}>
    <Edit2 size={16} />
  </button>
</div>
```

### EditorPage.jsx
```javascript
// Added imports
import RenameModal from '../components/RenameModal';

// Added states
const [showRenameModal, setShowRenameModal] = useState(false);
const [renamingDocId, setRenamingDocId] = useState(null);
const [renamingDocName, setRenamingDocName] = useState('');

// New handler functions
const handleEditDoc = (docId, docName) => {...}
const handleRenameDocument = (newName) => {...}

// Updated DocumentList props
<DocumentList
  ...
  onEditDoc={handleEditDoc}
/>

// Added RenameModal
<RenameModal
  isOpen={showRenameModal}
  onClose={() => setShowRenameModal(false)}
  currentName={renamingDocName}
  onRename={handleRenameDocument}
/>
```

### apiService.js
```javascript
// New function
async renameDocument(docId, newName) {
  console.log(`[API] Renaming document ${docId} to: ${newName}`);
  return { success: true, docId, name: newName };
}
```

---

## 🎨 UI/UX Features

✅ **Hover Effect**
- Edit button appears when you hover over a document
- Smooth opacity animation
- Doesn't clutter the normal view

✅ **Modal Dialog**
- Clean, centered modal
- Input field with focus
- Clear Cancel/Rename buttons
- Prevents invalid submissions

✅ **Visual Feedback**
- Edit button has different styling when document is selected
- Input field shows focus ring
- Button disables when name hasn't changed

✅ **Keyboard Support**
- Auto-focus on input field
- Can submit with Enter key
- Can close with Escape key

✅ **Responsive Design**
- Works on all screen sizes
- Touch-friendly button sizes
- Mobile-optimized modal

---

## 🚀 Testing the Feature

### To Test Locally:

1. **Visit the app**: http://localhost:5173/
2. **Look at documents** in the left sidebar
3. **Hover over any document** → See pencil icon appear
4. **Click the pencil icon** → Rename modal opens
5. **Type a new name** → See real-time input
6. **Click Rename** → Document name updates
7. **Try again** → Test cancel button

### Test Cases:
- ✅ Click edit button → Modal opens
- ✅ Type new name → Input updates
- ✅ Click Rename → Name changes in list
- ✅ Click Cancel → Modal closes without changes
- ✅ Leave name same → Rename button disabled
- ✅ Click outside → Can add Close-on-backdrop if needed

---

## 🔗 Component Tree

```
EditorPage
├── RenameModal (controlled by showRenameModal state)
├── DocumentList
│   └── Edit buttons for each document
│       └── triggers handleEditDoc()
│           └── opens RenameModal
├── CodeEditor
├── etc...
```

---

## 💾 State Flow

```
User clicks Edit Icon
     ↓
handleEditDoc(docId, name) called
     ↓
Set: renamingDocId, renamingDocName, showRenameModal
     ↓
RenameModal opens with current name
     ↓
User types new name
     ↓
User clicks Rename button
     ↓
handleRenameDocument(newName) called
     ↓
API call: apiService.renameDocument(docId, newName)
     ↓
Update documents array with new name
     ↓
Modal closes, list refreshes
```

---

## 🔌 Backend Integration

When ready to connect to your backend:

**Update `apiService.js`:**
```javascript
async renameDocument(docId, newName) {
  const response = await fetch(`${API_BASE_URL}/documents/${docId}/rename`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName })
  });
  return response.json();
}
```

Expected backend response:
```json
{
  "success": true,
  "docId": "doc-123",
  "name": "New Document Name"
}
```

---

## 📝 Features You Can Add

1. **Confirmation** - Ask "Are you sure?" before renaming
2. **Duplicate Name Prevention** - Check if name already exists
3. **Name Validation** - Limit length, allowed characters
4. **Undo/History** - Track previous names
5. **Auto-save Indicator** - Show "Saving..." state
6. **Keyboard Shortcut** - Alt+R or Cmd+R to rename
7. **Bulk Rename** - Rename multiple docs at once
8. **Name Search** - Filter by document name

---

## 🐛 Troubleshooting

**Edit button not showing?**
- Make sure you're hovering over the document item
- Check that opacity-0 and group-hover:opacity-100 are working

**Modal not opening?**
- Check browser console for errors
- Verify RenameModal component is imported

**Changes not saving?**
- Check if handleRenameDocument is being called
- Verify apiService.renameDocument is working
- Check network tab in DevTools

**Button disabled even with new name?**
- Modal checks if name changed: `newName !== currentName`
- Also checks if name is empty: `!newName.trim()`

---

## ✅ Current Status

- ✅ Feature fully implemented
- ✅ All components created/updated
- ✅ Dev server running
- ✅ Ready to test
- ⏭️ Ready for backend integration

---

**To Use:** Hover over any document in the left sidebar and click the pencil icon to rename!
