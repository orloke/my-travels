import { PageTemplate } from '../Templates/Pages';
import { client } from '../graphql/apollo';
import { useRouter } from 'next/router';
import { GetStaticProps } from 'next';
import { PageTemplateProps } from '../types/types';
import {
  GetPageBySlugDocument,
  GetPageBySlugQuery,
  GetPagesDocument,
  GetPagesQuery,
} from '../graphql/generated';
import { NextSeo } from 'next-seo';

export default function Page({ heading, body }: PageTemplateProps) {
  const router = useRouter();

  if (router.isFallback) return null;

  return (
    <>
      <NextSeo title={heading} />
      <PageTemplate heading={heading} body={body} />
    </>
  );
}

export const getStaticPaths = async () => {
  const { data } = await client.query<GetPagesQuery>({
    query: GetPagesDocument,
    variables: {
      first: 3,
    },
  });

  const paths = data.pages.map(({ slug }) => ({
    params: { slug },
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { data } = await client.query<GetPageBySlugQuery>({
    query: GetPageBySlugDocument,
    variables: {
      slug: `${params?.slug}`,
    },
  });

  if (!data.page) return { notFound: true };

  return {
    props: {
      heading: data.page?.heading,
      body: data.page?.body.html,
    },
    revalidate: 20,
  };
};
