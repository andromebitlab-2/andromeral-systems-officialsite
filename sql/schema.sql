-- ### ANDROMERAL SYSTEMS SCHEMA ###

-- 1. PROFILES TABLE
-- Stores public user data and links to auth.users.
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE,
  is_staff boolean DEFAULT false NOT NULL,
  avatar_url text, -- ADDED: To store user profile picture URL
  PRIMARY KEY (id)
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Function to create a profile when a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$;

-- Trigger to call the function on new user creation.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. POSTS TABLE
CREATE TABLE public.posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  title text NOT NULL,
  banner_image_url text NOT NULL,
  category text NOT NULL,
  author_id uuid NOT NULL REFERENCES public.profiles(id)
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;


-- 3. TAGS TABLE
CREATE TABLE public.tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  color text DEFAULT '#6B7280' NOT NULL -- Default gray color
);
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;


-- 4. POST_TAGS (JOIN TABLE)
CREATE TABLE public.post_tags (
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;


-- 5. POST_BLOCKS TABLE
CREATE TABLE public.post_blocks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  "order" integer NOT NULL,
  "type" text NOT NULL, -- e.g., 'text', 'code', 'image', 'changelog'
  content jsonb NOT NULL
);
ALTER TABLE public.post_blocks ENABLE ROW LEVEL SECURITY;


-- ### ROW LEVEL SECURITY (RLS) POLICIES ###

-- Helper function to check if the current user is a staff member.
CREATE OR REPLACE FUNCTION is_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND is_staff = true
  );
$$;

-- RLS for PROFILES table
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);


-- RLS for POSTS table
CREATE POLICY "Posts are viewable by everyone."
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY "Staff can create posts."
  ON public.posts FOR INSERT
  WITH CHECK (is_staff());

CREATE POLICY "Staff can update posts."
  ON public.posts FOR UPDATE
  USING (is_staff());
  
CREATE POLICY "Staff can delete posts."
  ON public.posts FOR DELETE
  USING (is_staff());


-- RLS for TAGS, POST_TAGS, POST_BLOCKS (similar logic)
-- Tags
CREATE POLICY "Tags are viewable by everyone." ON public.tags FOR SELECT USING (true);
CREATE POLICY "Staff can manage tags." ON public.tags FOR ALL USING (is_staff());
-- Post_Tags
CREATE POLICY "Post-tag links are viewable by everyone." ON public.post_tags FOR SELECT USING (true);
CREATE POLICY "Staff can manage post-tag links." ON public.post_tags FOR ALL USING (is_staff());
-- Post_Blocks
CREATE POLICY "Post blocks are viewable by everyone." ON public.post_blocks FOR SELECT USING (true);
CREATE POLICY "Staff can manage post blocks." ON public.post_blocks FOR ALL USING (is_staff());


-- ### STORAGE ###
--
-- INSTRUCTIONS:
-- 1. In the Supabase dashboard, go to Storage and create a new public bucket named 'post-banners'.
-- 2. In the Supabase dashboard, go to Storage and create another new public bucket named 'avatars'.
-- 3. In the Supabase SQL Editor, run all the policies below to secure your buckets.

-- Policies for 'post-banners' bucket
CREATE POLICY "Public read access for post banners" ON storage.objects FOR SELECT USING ( bucket_id = 'post-banners' );
CREATE POLICY "Staff can manage post banners" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'post-banners' AND is_staff() );
CREATE POLICY "Staff can update post banners" ON storage.objects FOR UPDATE USING ( bucket_id = 'post-banners' AND is_staff() );
CREATE POLICY "Staff can delete post banners" ON storage.objects FOR DELETE USING ( bucket_id = 'post-banners' AND is_staff() );

-- Policies for 'avatars' bucket
CREATE POLICY "Public read access for avatars" ON storage.objects FOR SELECT USING ( bucket_id = 'avatars' );

CREATE POLICY "Users can insert their own avatar" ON storage.objects
  FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE
  USING ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE
  USING ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid );


-- ### ADMIN SETUP INSTRUCTIONS ###
--
-- After a user has signed up through your application, you can make them
-- a staff member by running the following SQL command in the Supabase SQL Editor.
--
-- Replace 'user_id_to_make_admin' with the actual user's ID from the `auth.users` table.
--
-- UPDATE public.profiles
-- SET is_staff = true
-- WHERE id = 'user_id_to_make_admin';
