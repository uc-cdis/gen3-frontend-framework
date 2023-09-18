import React from 'react';
import { GetStaticProps } from 'next';
import NavPageLayout, {
  NavPageLayoutProps,
} from '../../features/Navigation/NavPageLayout';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Text } from '@mantine/core';
import { FaExternalLinkAlt } from 'react-icons/fa';

const AboutUsPage = ({ footerProps, headerProps }: NavPageLayoutProps) => {
  const { basePath } = useRouter();
  return (
    <NavPageLayout {...{ footerProps, headerProps }}>
      <div className="flex flex-row justify-center h-full">
        <div className="flex flex-col justify-evenly pb-10 text-xl max-w-10">
          <div className="pb-10 pt-10 text-sm">
            <Link href={'/'}>Home&nbsp;</Link>
            {' > '}
            <span className="text-heal-primary">&nbsp;About Us</span>
          </div>
          <h1 className="font-bold text-4xl text-gen3-coal font-montserrat pb-4">
            About Us
          </h1>
          <Text className="prose text-black text-2xl p-8">
            The HEAL Platform is powered by the{' '}
            <span className="font-bold">Gen3</span> Data Commons Software Stack
            developed by the&nbsp;
            <a
              className="text-gen3-base_blue no-underline"
              href="https://ctds.uchicago.edu/"
              target="_blank"
              rel="noreferrer"
            >
              Center for Translational Data Science
            </a>
            &nbsp;at the University of Chicago.
          </Text>
          <Text className="prose text-black text-2xl p-8">
            We believe in{' '}
            <span className="font-bold">
              Open Data, Open Source and Open Infrastructure.
            </span>
            <a
              className="text-gen3-base_blue flex flex-row items-baseline no-underline font-bold"
              href="https://gen3.org/"
              target="_blank"
              rel="noreferrer"
            >
              <FaExternalLinkAlt className="pr-1 pt-2" />
              About Gen3
            </a>
          </Text>
          <Text className="prose text-black text-2xl p-8">
            Check out other{' '}
            <span className="font-bold">Data Platforms powered by Gen3:</span>
            <a
              className="text-gen3-base_blue flex flex-row items-baseline no-underline font-bold"
              href="https://gen3.org/powered-by-gen3/"
              target="_blank"
              rel="noreferrer"
            >
              <FaExternalLinkAlt className="pr-1 pt-2" />
              About Gen3 Projects
            </a>
          </Text>
          <Text className="prose text-black text-2xl p-8">
            Check out our{' '}
            <span className="font-bold">Software Stack on GitHub:</span>
            <a
              className="text-gen3-base_blue flex flex-row items-baseline no-underline font-bold"
              href="https://github.com/search?q=topic%3Agen3+org%3Auc-cdis&type=Repositories"
              target="_blank"
              rel="noreferrer"
            >
              <FaExternalLinkAlt className="pr-1 pt-2" />
              Gen3 on GitHub
            </a>
          </Text>
        </div>
        <div className="flex flex-col pr-8 pt-40">
          <Image
            className="align-middle"
            src={`${basePath}/icons/gen3-dark.png`}
            width={400}
            height={200}
            alt="Gen3 Logo"
          />
        </div>
      </div>
    </NavPageLayout>
  );
};

// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
export const getStaticProps: GetStaticProps<NavPageLayoutProps> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default AboutUsPage;
