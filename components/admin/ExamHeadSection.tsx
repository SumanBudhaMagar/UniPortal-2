'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ---------- Types ---------- */
export interface ExamHead {
  id: string;
  name: string;
  email: string;
}

interface ExamHeadSectionProps {
  examHeads: ExamHead[];
  onAddExamHead: (data: {
    name: string;
    email: string;
  }) => Promise<void>;
  onDeleteExamHead: (id: string) => Promise<void>;
}

/* ---------- Component ---------- */
export default function ExamHeadSection({
  examHeads,
  onAddExamHead,
  onDeleteExamHead,
}: ExamHeadSectionProps) {
  const [showAddExamHead, setShowAddExamHead] = useState(false);
  const [newExamHead, setNewExamHead] = useState({
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await onAddExamHead(newExamHead);
    setNewExamHead({ name: "", email: "" });
    setShowAddExamHead(false);
    setLoading(false);
  };

  return (
    <Card className="login">
      {/* Header */}
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>📝 Exam Heads</CardTitle>
        <Button
          onClick={() => setShowAddExamHead(!showAddExamHead)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          + Authorize Exam Head
        </Button>
      </CardHeader>

      <CardContent>
        {/* Add Exam Head Form */}
        {showAddExamHead && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 p-4 bg-purple-50 rounded-lg space-y-4"
          >
            <div className="space-y-4">
              <div>
                <Label>Exam Head Name</Label>
                <Input
                  value={newExamHead.name}
                  onChange={(e) =>
                    setNewExamHead({
                      ...newExamHead,
                      name: e.target.value,
                    })
                  }
                  placeholder="Dr. Jane Smith"
                  required
                />
              </div>

              <div>
                <Label>Exam Head Email (KU Email)</Label>
                <Input
                  type="email"
                  value={newExamHead.email}
                  onChange={(e) =>
                    setNewExamHead({
                      ...newExamHead,
                      email: e.target.value,
                    })
                  }
                  placeholder="examhead@ku.edu.np"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700"
                disabled={loading}
              >
                {loading ? "Authorizing..." : "Authorize Exam Head"}
              </Button>
              <Button
                type="button"
                onClick={() => setShowAddExamHead(false)}
                className="bg-gray-400"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Exam Head List */}
        <div className="space-y-3">
          {examHeads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No Exam Heads authorized yet.
            </div>
          ) : (
            examHeads.map((examHead) => (
              <div
                key={examHead.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div>
                  <div className="font-semibold">{examHead.name}</div>
                  <div className="text-sm text-gray-600">
                    {examHead.email}
                  </div>
                  <div className="text-sm text-purple-600">
                    Head of Exam Center
                  </div>
                </div>

                <Button
                  onClick={() => onDeleteExamHead(examHead.id)}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Remove
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
