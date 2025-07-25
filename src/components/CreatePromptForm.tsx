@@ .. @@
 import React, { useState } from 'react';
 import { X, Plus, Trash2 } from 'lucide-react';

 interface CreatePromptFormProps {
   isOpen: boolean;
   onClose: () => void;
   onSubmit: (promptData: any) => void;
+  editingPrompt?: any;
 }

-const CreatePromptForm: React.FC<CreatePromptFormProps> = ({ isOpen, onClose, onSubmit }) => {
+const CreatePromptForm: React.FC<CreatePromptFormProps> = ({ isOpen, onClose, onSubmit, editingPrompt }) => {
   const [formData, setFormData] = useState({
     title: '',
     description: '',
     prompt: '',
     category: '',
     tags: [] as string[],
     isPublic: false
   });

   const [newTag, setNewTag] = useState('');

+  // Update form data when editing prompt changes
+  React.useEffect(() => {
+    if (editingPrompt) {
+      setFormData({
+        title: editingPrompt.title || '',
+        description: editingPrompt.description || '',
+        prompt: editingPrompt.user || editingPrompt.description || '',
+        category: editingPrompt.functionalArea || '',
+        tags: editingPrompt.tags || [],
+        isPublic: false
+      });
+    } else {
+      setFormData({
+        title: '',
+        description: '',
+        prompt: '',
+        category: '',
+        tags: [],
+        isPublic: false
+      });
+    }
+  }, [editingPrompt]);
+
   if (!isOpen) return null;

   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     onSubmit(formData);
     onClose();
-    setFormData({
-      title: '',
-      description: '',
-      prompt: '',
-      category: '',
-      tags: [],
-      isPublic: false
-    });
   };

@@ .. @@
       <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
         <div className="flex justify-between items-center mb-6">
-          <h2 className="text-2xl font-bold text-gray-900">Create New Prompt</h2>
+          <h2 className="text-2xl font-bold text-gray-900">
+            {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
+          </h2>
           <button
             onClick={onClose}
             className="text-gray-400 hover:text-gray-600"
@@ .. @@
             <button
               type="submit"
               className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
             >
-              Create Prompt
+              {editingPrompt ? 'Update Prompt' : 'Create Prompt'}
             </button>
           </div>
         </form>