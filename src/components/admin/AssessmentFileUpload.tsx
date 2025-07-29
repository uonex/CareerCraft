import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, Download, FileText, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AssessmentFileUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface AssessmentData {
  assessmentId?: string;
  name: string;
  description: string;
  duration: string;
  questions: Array<{
    id: string;
    type: 'single_choice' | 'multi_choice' | 'text_input';
    questionText: string;
    options?: Array<{ text: string; value: string }>;
    scoring?: Record<string, number>;
    nextQuestionLogic?: Array<{ ifValue: string; goTo: string }>;
    minSelections?: number;
    maxSelections?: number;
    placeholder?: string;
  }>;
  resultsLogic?: Array<{
    ifScoreRange?: [number, number];
    recommendation: string;
  }>;
}

const AssessmentFileUpload = ({ open, onOpenChange, onSuccess }: AssessmentFileUploadProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    estimated_duration: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState<AssessmentData | null>(null);

  const generateTemplate = () => {
    const template: AssessmentData = {
      assessmentId: "unique-assessment-id",
      name: "Sample Assessment",
      description: "A sample assessment to demonstrate the structure",
      duration: "20-30 minutes",
      questions: [
        {
          id: "q1",
          type: "single_choice",
          questionText: "What energizes you the most?",
          options: [
            { text: "Solving complex problems", value: "problem_solving" },
            { text: "Creating something beautiful", value: "creativity" },
            { text: "Helping others succeed", value: "helping_others" }
          ],
          scoring: {
            problem_solving: 5,
            creativity: 3,
            helping_others: 4
          },
          nextQuestionLogic: [
            { ifValue: "problem_solving", goTo: "q2_technical" },
            { ifValue: "creativity", goTo: "q2_creative" }
          ]
        },
        {
          id: "q2_technical",
          type: "multi_choice",
          questionText: "Which technical skills do you enjoy using?",
          options: [
            { text: "Coding", value: "coding" },
            { text: "Data Analysis", value: "data_analysis" },
            { text: "Network Management", value: "network_management" }
          ],
          scoring: { coding: 2, data_analysis: 3 },
          minSelections: 1,
          maxSelections: 2
        },
        {
          id: "q2_creative",
          type: "text_input",
          questionText: "Describe your ideal creative work environment:",
          placeholder: "e.g., collaborative studio, quiet space, fast-paced team..."
        }
      ],
      resultsLogic: [
        { ifScoreRange: [0, 10], recommendation: "Introductory careers in your area of interest" },
        { ifScoreRange: [11, 20], recommendation: "Growth-oriented careers with leadership potential" }
      ]
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assessment-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Template downloaded successfully!");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json') {
        toast.error("Please select a JSON file");
        return;
      }
      setSelectedFile(file);
      parseFile(file);
    }
  };

  const parseFile = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as AssessmentData;
      
      // Basic validation
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("Invalid format: questions array is required");
      }
      
      if (data.questions.length === 0) {
        throw new Error("Assessment must contain at least one question");
      }

      // Validate each question
      for (const question of data.questions) {
        if (!question.id || !question.type || !question.questionText) {
          throw new Error("Each question must have id, type, and questionText");
        }
        
        if (question.type === 'single_choice' || question.type === 'multi_choice') {
          if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
            throw new Error(`Question ${question.id} must have options array`);
          }
        }
      }

      setParsedData(data);
      
      // Pre-fill form data from file if available
      if (data.name) setFormData(prev => ({ ...prev, name: data.name }));
      if (data.description) setFormData(prev => ({ ...prev, description: data.description }));
      if (data.duration) setFormData(prev => ({ ...prev, estimated_duration: data.duration }));
      
      toast.success("File parsed successfully!");
    } catch (error) {
      console.error("Error parsing file:", error);
      toast.error(`Invalid JSON file: ${error instanceof Error ? error.message : "Unknown error"}`);
      setSelectedFile(null);
      setParsedData(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !parsedData) {
      toast.error("Please select and validate a JSON file");
      return;
    }

    setUploading(true);
    
    try {
      // Create the assessment type
      const { data: assessmentType, error: assessmentError } = await (supabase as any)
        .from("assessment_types")
        .insert({
          name: formData.name,
          description: formData.description,
          estimated_duration: formData.estimated_duration,
          is_active: true,
          content_file_name: selectedFile.name,
          content_uploaded_at: new Date().toISOString()
        })
        .select()
        .single();

      if (assessmentError) throw assessmentError;

      // Insert questions
      const questionsToInsert = parsedData.questions.map((question, index) => ({
        assessment_type_id: assessmentType.id,
        question_id: question.id,
        question_type: question.type,
        question_text: question.questionText,
        options: question.options || [],
        scoring: question.scoring || {},
        next_question_logic: question.nextQuestionLogic || [],
        min_selections: question.minSelections || 1,
        max_selections: question.maxSelections || 1,
        placeholder: question.placeholder || null,
        order_index: index
      }));

      const { error: questionsError } = await (supabase as any)
        .from("assessment_questions")
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      // Insert results logic if available
      if (parsedData.resultsLogic && parsedData.resultsLogic.length > 0) {
        const resultsToInsert = parsedData.resultsLogic.map(logic => ({
          assessment_type_id: assessmentType.id,
          condition_type: logic.ifScoreRange ? 'score_range' : 'answer_combination',
          condition_data: logic.ifScoreRange 
            ? { min_score: logic.ifScoreRange[0], max_score: logic.ifScoreRange[1] }
            : {},
          recommendation: logic.recommendation
        }));

        const { error: resultsError } = await (supabase as any)
          .from("assessment_results_logic")
          .insert(resultsToInsert);

        if (resultsError) throw resultsError;
      }

      toast.success("Assessment created successfully!");
      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating assessment:", error);
      toast.error("Failed to create assessment");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", estimated_duration: "" });
    setSelectedFile(null);
    setParsedData(null);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setParsedData(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Assessment</DialogTitle>
          <DialogDescription>
            Create a new assessment type by uploading a structured JSON file
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Assessment Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Emotional Intelligence Test"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this assessment measures..."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Duration</Label>
              <Input
                id="duration"
                value={formData.estimated_duration}
                onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                placeholder="e.g., 30-45 minutes"
                required
              />
            </div>
          </div>

          {/* File Upload Section */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Upload className="h-12 w-12 text-muted-foreground" />
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Upload Assessment File</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a JSON file structured according to our template format
                </p>
                
                <div className="flex gap-2 justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateTemplate}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </div>
              
              {!selectedFile ? (
                <div>
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="max-w-xs mx-auto"
                  />
                </div>
              ) : (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      {parsedData && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          ✓ Valid ({parsedData.questions.length} questions)
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* File Preview */}
          {parsedData && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Assessment Preview</h4>
              <div className="text-sm space-y-1">
                <p><strong>Questions:</strong> {parsedData.questions.length}</p>
                <p><strong>Question Types:</strong> {
                  [...new Set(parsedData.questions.map(q => q.type))].join(', ')
                }</p>
                {parsedData.resultsLogic && (
                  <p><strong>Results Logic:</strong> {parsedData.resultsLogic.length} rules</p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedFile || !parsedData || uploading}
            >
              {uploading ? "Creating..." : "Create Assessment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentFileUpload;