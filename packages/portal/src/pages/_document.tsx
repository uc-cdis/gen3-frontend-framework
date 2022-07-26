import Document, { DocumentContext, DocumentInitialProps } from 'next/document';

class Gen3Document extends Document {
  static async getInitialProps(
    ctx: DocumentContext,
  ): Promise<DocumentInitialProps> {
    return await Document.getInitialProps(ctx);
  }
}

export default Gen3Document;
