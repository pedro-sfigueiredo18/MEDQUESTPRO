
import { supabase } from "./supabaseClient";
import { generateQuestion } from "./questionGenerator"; // Assuming this still exists and works independently
import { QuestaoGerada, Alternativa } from "@/hooks/useQuestaoForm"; // Adjust path if needed

// Type matching the Supabase 'questions' table structure
export interface QuestionFromDB {
  id: string; // uuid
  created_at: string; // timestamp with time zone
  reference: string | null;
  theme: string | null;
  learning_objective: string | null;
  difficulty: string | null;
  question_type: string; // e.g., 'multiple_choice', 'essay'
  statement: string;
  user_id: string | null; // uuid
}

// Type matching the Supabase 'alternatives' table structure
export interface AlternativeFromDB {
  id: string; // uuid
  created_at: string; // timestamp with time zone
  question_id: string; // uuid
  text: string;
  is_correct: boolean;
}

// Combined type for a question with its alternatives
export type QuestaoCompleta = QuestionFromDB & {
  alternatives: AlternativeFromDB[];
};

/**
 * Saves a generated question and its alternatives (if any) to the Supabase database.
 * @param questao The generated question data.
 * @param referencia The reference text.
 * @param userId The ID of the user creating the question.
 * @returns The saved question data from the database.
 */
export async function saveQuestion(
  questao: QuestaoGerada,
  referencia: string,
  userId: string
): Promise<QuestionFromDB> {
  try {
    // 1. Insert the main question data
    const { data: questionData, error: questionError } = await supabase
      .from("questions")
      .insert({
        reference: referencia,
        theme: questao.tema,
        learning_objective: questao.objetivoAprendizagem,
        difficulty: questao.nivelDificuldade,
        question_type: questao.modeloQuestao,
        statement: questao.enunciado,
        user_id: userId,
      })
      .select()
      .single();

    if (questionError) {
      console.error("Error saving question:", questionError);
      throw questionError;
    }

    // 2. If it's a multiple-choice question, insert alternatives
    if (
      questao.modeloQuestao === "multiple_choice" &&
      questao.alternativas &&
      questao.alternativas.length > 0
    ) {
      const alternativesToInsert = questao.alternativas.map((alt) => ({
        question_id: questionData.id,
        text: alt.texto,
        is_correct: alt.correta,
      }));

      const { error: alternativesError } = await supabase
        .from("alternatives")
        .insert(alternativesToInsert);

      if (alternativesError) {
        console.error("Error saving alternatives:", alternativesError);
        // Optional: Consider deleting the question if alternatives fail?
        throw alternativesError;
      }
    }

    return questionData as QuestionFromDB;
  } catch (error) {
    console.error("Failed in saveQuestion:", error);
    throw error;
  }
}

/**
 * Fetches all questions created by a specific user.
 * @param userId The ID of the user.
 * @returns An array of questions with their alternatives.
 */
export async function getAllQuestions(userId: string): Promise<QuestaoCompleta[]> {
  try {
    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("*, alternatives(*)") // Fetch questions and their related alternatives
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (questionsError) {
      console.error("Error fetching questions:", questionsError);
      throw questionsError;
    }

    // Ensure alternatives is always an array
    return questions.map(q => ({ ...q, alternatives: q.alternatives || [] })) as QuestaoCompleta[];

  } catch (error) {
    console.error("Failed in getAllQuestions:", error);
    throw error;
  }
}

/**
 * Fetches a specific question by its ID, ensuring it belongs to the user.
 * @param id The ID of the question.
 * @param userId The ID of the user.
 * @returns The question with alternatives, or null if not found or not owned by the user.
 */
export async function getQuestionById(
  id: string,
  userId: string
): Promise<QuestaoCompleta | null> {
  try {
    const { data: question, error } = await supabase
      .from("questions")
      .select("*, alternatives(*)")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") { // Code for "Row not found"
        return null;
      }
      console.error("Error fetching question by ID:", error);
      throw error;
    }

     // Ensure alternatives is always an array
    return { ...question, alternatives: question.alternatives || [] } as QuestaoCompleta;

  } catch (error) {
    console.error("Failed in getQuestionById:", error);
    throw error;
  }
}

/**
 * Processes the question form data, generates the question using an external service/AI,
 * and saves it to the Supabase database.
 * @param formData The data from the question creation form.
 * @param userId The ID of the user creating the question.
 * @returns The saved question data from the database.
 */
export async function processQuestionForm(
  formData: {
    referencia: string;
    tema: string;
    objetivoAprendizagem: string;
    nivelDificuldade: string;
    modeloQuestao: string;
    // tipoReferencia: string; // Not used in generateQuestion or saveQuestion currently
    // arquivoReferencia: File | null; // Not used currently
  },
  userId: string
): Promise<QuestionFromDB> {
  try {
    // 1. Generate the question content (assuming generateQuestion handles AI interaction)
    // IMPORTANT: Ensure generateQuestion returns data in the QuestaoGerada format
    const questaoGerada: QuestaoGerada = await generateQuestion({
      referencia: formData.referencia,
      tema: formData.tema,
      objetivoAprendizagem: formData.objetivoAprendizagem,
      nivelDificuldade: formData.nivelDificuldade,
      modeloQuestao: formData.modeloQuestao,
    });

    // 2. Save the generated question to Supabase
    return await saveQuestion(questaoGerada, formData.referencia, userId);

  } catch (error) {
    console.error("Erro ao processar formulário de questão:", error);
    throw error;
  }
}

// Note: Functions like getQuestionsByTema might be better implemented
// with more specific Supabase queries or handled client-side after fetching all questions.
// Removing the old localStorage-based getQuestionsByTema.

