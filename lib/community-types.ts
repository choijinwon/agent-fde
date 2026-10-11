export type CommunityKind = "question" | "case";
export type PostKind = CommunityKind;
export type CommunityStatus = "published" | "hidden" | "deleted";

export interface CommunityPost {
  id: string;
  kind: CommunityKind;
  industry: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  status: CommunityStatus;
}

export interface CommunityComment {
  id: string;
  postId: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  status: CommunityStatus;
}

export interface CommunityUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface CommunityReport {
  id: string;
  targetType: "post" | "comment";
  targetId: string;
  postId: string;
  reason: "spam" | "abuse" | "privacy" | "other";
  details: string;
  reporterId: string;
  createdAt: string;
  resolvedAt: string | null;
}

export interface CommunityPostList {
  posts: CommunityPost[];
  available: boolean;
  nextCursor: string | null;
}

export interface CommunityPostDetail {
  post: CommunityPost | null;
  comments: CommunityComment[];
  available: boolean;
}

export const COMMUNITY_INDUSTRIES = [
  { value: "academy", label: "학원" },
  { value: "hospital", label: "병원·의원" },
  { value: "manufacturing", label: "제조·ERP" },
  { value: "excel-accounting", label: "엑셀·회계" },
  { value: "commerce", label: "쇼핑몰·유통" },
  { value: "logistics", label: "물류·재고" },
  { value: "store", label: "매장" },
  { value: "office", label: "사무·전문서비스" },
  { value: "custom", label: "기타" },
] as const;

// Friendly aliases for presentation components.
export type PublicPost = CommunityPost;
export type PublicComment = CommunityComment;
