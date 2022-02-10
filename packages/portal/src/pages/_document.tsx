import Document, { DocumentContext, DocumentInitialProps } from "next/document";

class Gen3Document extends Document {
  static async getInitialProps(
    ctx: DocumentContext,
  ): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);
    return initialProps;
  }
}

export default Gen3Document;
