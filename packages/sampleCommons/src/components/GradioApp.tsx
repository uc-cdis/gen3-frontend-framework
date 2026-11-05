import React from 'react';
import Script from 'next/script';
import validator from 'validator';

const GradioApp = ({ app }: { app: string }) => {
  // Validate the app identifier
  const isValidApp = (appName: string): boolean => {
    if (!appName || appName.trim().length === 0) {
      return false;
    }

    // Check format: username/space-name
    const validSpacePattern = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/;
    if (!validSpacePattern.test(appName)) {
      return false;
    }

    // Validate the full URL
    const url = `https://${appName}.hf.space`;
    if (
      !validator.isURL(url, {
        protocols: ['https'],
        require_protocol: true,
        require_valid_protocol: true,
        allow_query_components: false,
        allow_fragments: false,
      })
    ) {
      return false;
    }

    return true;
  };

  if (!isValidApp(app)) {
    return (
      <div className="m-2 w-full p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">
          Invalid app identifier. Please provide a valid Hugging Face Space in
          the format: username/space-name
        </p>
      </div>
    );
  }

  const sanitizedApp = app.trim();
  const gradioUrl = `https://${sanitizedApp}.hf.space`;

  return (
    <>
      <Script
        type="module"
        src="https://gradio.s3-us-west-2.amazonaws.com/5.47.1/gradio.js"
        strategy="lazyOnload"
      />

      <div className="m-2 w-full">
        <gradio-app src={gradioUrl} />
      </div>
    </>
  );
};

export default GradioApp;
