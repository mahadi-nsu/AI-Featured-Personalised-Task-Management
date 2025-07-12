export type Article = {
  id: number;
  title: string;
  description: string;
  cover_image: string | null;
  readable_publish_date: string;
  url: string;
  comments_count: number;
  public_reactions_count: number;
  reading_time_minutes: number;
  tag_list: string[];
  tags: string;
  user: {
    name: string;
    profile_image_90: string;
  };
};
