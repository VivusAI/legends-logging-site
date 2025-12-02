import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCallback, useReducer } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadFile } from "../api/useUploadFile";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500mb

enum FileUploadStatus {
  QUEUED = "queued",
  PENDING = "pending",
  SUCCESS = "success",
  ERROR = "error",
}

interface FileUpload {
  id: string;
  file: File;
  status: string;
}

interface UploadState {
  files: FileUpload[];
  isPending: boolean;
}

type FileAction =
  | { type: "ADD_FILE"; file: File; id: string }
  | { type: "UPDATE_FILE_STATUS"; id: string; status: FileUploadStatus };

function reducer(state: UploadState, action: FileAction) {
  switch (action.type) {
    case "ADD_FILE":
      return {
        ...state,
        files: [
          ...state.files,
          {
            id: action.id,
            file: action.file,
            status: FileUploadStatus.QUEUED,
          },
        ],
      };
    case "UPDATE_FILE_STATUS":
      return {
        ...state,
        files: state.files.map((file) =>
          file.id === action.id ? { ...file, status: action.status } : file,
        ),
      };
    default:
      return state;
  }
}

export function UploadDialog() {
  const { mutate } = useUploadFile();

  const [uploadState, dispatch] = useReducer(reducer, {
    files: [],
    isPending: false,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles
      .filter(
        (file) => file.name && file.size > 0 && file.size <= MAX_FILE_SIZE,
      )
      .map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
      }));

    for (const file of newFiles) {
      console.log(file);
      dispatch({ type: "ADD_FILE", file: file.file, id: file.id });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxSize: MAX_FILE_SIZE,
    onDrop,
  });

  function handleUpload() {
    for (const file of uploadState.files) {
      dispatch({
        type: "UPDATE_FILE_STATUS",
        id: file.id,
        status: FileUploadStatus.PENDING,
      });
      mutate(file.file, {
        onSuccess: () => {
          dispatch({
            type: "UPDATE_FILE_STATUS",
            id: file.id,
            status: FileUploadStatus.SUCCESS,
          });
        },
        onError: () => {
          dispatch({
            type: "UPDATE_FILE_STATUS",
            id: file.id,
            status: FileUploadStatus.ERROR,
          });
        },
      });
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Upload files</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
        </DialogHeader>

        <div>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed p-4 rounded-md ${
              isDragActive ? "border-blue-500" : "border-gray-300"
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-gray-500">Drop the files here ...</p>
            ) : (
              <p className="text-gray-500">
                Drag 'n' drop some files here, or click to select files
              </p>
            )}
          </div>
        </div>
        <div>
          {uploadState.files.map((file) => (
            <div key={file.id} className="flex items-center mt-2">
              <span className="text-foreground">{file.file.name}</span>
              <div className="ml-4">
                {file.status === "queued" && (
                  <span className="text-blue-500">Queued</span>
                )}
                {file.status === "pending" && (
                  <span className="text-yellow-500">Uploading...</span>
                )}
                {file.status === "success" && (
                  <span className="text-green-500">Uploaded</span>
                )}
                {file.status === "error" && (
                  <span className="text-red-500">Error</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={handleUpload}>Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
