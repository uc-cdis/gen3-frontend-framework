import React from 'react';
import { MdOutlineArrowBack as BackIcon } from 'react-icons/md';
import { useRouter } from 'next/router';

interface BackLinkProps {
  currentPage: string;
}

const BackLink = ({ currentPage }: BackLinkProps) => {
  const router = useRouter();

  return (
    <button onClick={() => router.back()}>
      <div className="flex items-center gap-4 text-xl text-primary-darker">
        <div className="rounded-full border-1 w-8 h-8 bg-white flex justify-center items-center">
          <BackIcon />
        </div>
        {currentPage}
      </div>
    </button>
  );
};

export default BackLink;
