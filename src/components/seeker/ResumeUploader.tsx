
import { useState, ChangeEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { resumeApi } from "@/services/api";
import { Resume } from "@/types";

interface ResumeUploaderProps {
  userId: string;
  onUploadSuccess: (resume: Resume) => void;
  onCancel: () => void;
}

export default function ResumeUploader({ userId, onUploadSuccess, onCancel }: ResumeUploaderProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) {
      return;
    }
    
    // Validate file type
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setFileError("Please upload a PDF or Word document (.pdf, .doc, .docx)");
      return;
    }
    
    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setFileError("File size must be less than 5MB");
      return;
    }
    
    setFile(selectedFile);
    
    // Auto-fill title if empty
    if (!title) {
      const fileName = selectedFile.name.split('.')[0];
      setTitle(fileName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setFileError("Please select a file to upload");
      return;
    }
    
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", file);
      
      // In a real app, this would call the API
      // const resume = await resumeApi.uploadResume(userId, formData);
      
      // Mock response for demonstration
      const mockResume: Resume = {
        id: Date.now().toString(),
        userId,
        title,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        isDefault: false
      };
      
      toast({
        title: "Resume uploaded",
        description: "Your resume has been successfully uploaded.",
      });
      
      onUploadSuccess(mockResume);
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Upload Resume</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Resume Title</Label>
            <Input
              id="title"
              placeholder="e.g., Software Developer Resume"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file">Resume File</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-md px-6 py-8 text-center">
              {file ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <div className="bg-indigo-100 rounded-full p-2 mr-3">
                      <Upload className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="font-medium">{file.name}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Replace file
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-1">
                    Drag and drop your resume, or click to browse
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    PDF or Word documents, max 5MB
                  </p>
                  <Input
                    id="file"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => document.getElementById("file")?.click()}
                  >
                    Select File
                  </Button>
                </>
              )}
            </div>
            {fileError && <p className="text-sm text-red-500">{fileError}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isUploading || !file}>
            {isUploading ? "Uploading..." : "Upload Resume"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
