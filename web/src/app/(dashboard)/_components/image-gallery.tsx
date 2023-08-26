import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';

export async function ImageGallery() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: images, error } = await supabase.storage.from('images').list(user?.id, {
    sortBy: {
      column: 'created_at',
      order: 'desc',
    },
  });

  if (!images || error || !user) return null;

  const imagePaths = images.map((image) => `${user?.id}/${image.name}`);

  const { data: signedUrls } = await supabase.storage
    .from('images')
    .createSignedUrls(imagePaths, 60);

  console.log(signedUrls);

  if (!signedUrls || signedUrls.length === 0) return null;

  // return <Image src={signedUrls[0].signedUrl} alt="image" width={80} height={200} />;

  return (
    <ScrollArea>
      {signedUrls?.map(({ signedUrl }) => (
        <Image key={signedUrl} src={signedUrl} alt="image" width={300} height={500} />
      ))}
    </ScrollArea>
  );
}