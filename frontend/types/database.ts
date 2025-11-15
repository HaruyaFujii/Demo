export interface Assignment {
  id: string;
  title: string;
  description: string;
  github_repo_url: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  user_type: 'student' | 'recruiter';
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  user_id: string;
  pr_url: string;
  status: 'submitted' | 'reviewing' | 'approved' | 'rejected';
  submitted_at: string;
  updated_at: string;
}

export interface SubmissionWithUser extends Submission {
  user_email?: string;
  user_name?: string;
}
