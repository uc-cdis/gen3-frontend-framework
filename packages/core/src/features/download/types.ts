export interface JobStatus {
  uid: string;
  status: 'Running' | 'Completed' | 'Failed' | 'Unknown';
  name: string;
}

export interface JobOutput {
  output: string;
}

export interface DownloadStatus {
  inProgress: boolean;
  uid: string;
  message: {
    content: string | { msg: string; url: string };
    active: boolean;
    title: string;
  };
}
