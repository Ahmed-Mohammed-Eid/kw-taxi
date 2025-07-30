// FileUpload.tsx
import React, { useRef, useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './FileUploadComponent.module.scss';

export interface FileObject {
    id: string;
    file: File;
    name: string;
    size: number;
    type: string;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress: number;
}

interface FileUploadProps {
    files: FileObject[]; // Files provided by parent
    onFilesSelected: (files: FileList) => void; // Called when files are selected
    onRemoveFile: (fileId: string) => void; // Called when a file is removed
    acceptedTypes?: string;
    maxFileSize?: number;
    maxFiles?: number;
    disabled?: boolean;
    className?: string;
}

const FileUploadComponent: React.FC<FileUploadProps> = ({
    files, // Files passed from parent
    onFilesSelected, // Callback when files are selected
    onRemoveFile, // Callback when a file is removed
    acceptedTypes = '*/*',
    maxFileSize = 10 * 1024 * 1024, // 10MB
    maxFiles = 10,
    disabled = false,
    className = ''
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const validateFiles = (newFiles: FileList): FileList => {
        const dataTransfer = new DataTransfer();
        const currentCount = files.length;
        const remainingSlots = maxFiles ? maxFiles - currentCount : Number.MAX_SAFE_INTEGER;

        if (remainingSlots <= 0) {
            console.warn(`Cannot add more than ${maxFiles} files`);
            return dataTransfer.files; // Return empty FileList
        }

        const newFilesArray = Array.from(newFiles);
        for (const file of newFilesArray) {
            if (maxFileSize && file.size > maxFileSize) {
                console.warn(`File ${file.name} exceeds maximum size of ${formatFileSize(maxFileSize)}`);
                continue;
            }

            if (dataTransfer.items.length < remainingSlots) {
                dataTransfer.items.add(file);
            } else {
                console.warn(`Cannot add more than ${maxFiles} files, skipping ${file.name}`);
            }
        }

        return dataTransfer.files;
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (!disabled) {
            const validFiles = validateFiles(e.dataTransfer.files);
            onFilesSelected(validFiles);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (type: string): string => {
        if (type.startsWith('image/')) return '🖼️';
        if (type.startsWith('video/')) return '🎥';
        if (type.startsWith('audio/')) return '🎵';
        if (type.includes('pdf')) return '📄';
        if (type.includes('word')) return '📝';
        if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
        return '📁';
    };

    return (
        <div className={`${styles.container} ${className}`}>
            <div
                className={`${styles.dropzone} ${isDragOver ? styles.dragOver : ''} ${disabled ? styles.disabled : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && fileInputRef.current?.click()}
            >
    <input 
        ref={fileInputRef} 
        type="file" 
        multiple 
        className={styles.hiddenInput} 
        onChange={(e) => {
            if (e.target.files) {
                const validFiles = validateFiles(e.target.files);
                onFilesSelected(validFiles);
            }
        }} 
        accept={acceptedTypes} 
        disabled={disabled} 
    />

                <div className={styles.uploadIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="File / Cloud_Upload">
                            <path
                                id="Vector"
                                d="M12 16V10M12 10L9 12M12 10L15 12M23 15C23 12.7909 21.2091 11 19 11C18.9764 11 18.9532 11.0002 18.9297 11.0006C18.4447 7.60802 15.5267 5 12 5C9.20335 5 6.79019 6.64004 5.66895 9.01082C3.06206 9.18144 1 11.3498 1 13.9999C1 16.7613 3.23858 19.0001 6 19.0001L19 19C21.2091 19 23 17.2091 23 15Z"
                                stroke="#777777"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </g>
                    </svg>
                </div>
            </div>

            {files.length > 0 && (
                <div className={styles.fileList}>
                    {files.map((fileObj) => (
                        <div key={fileObj.id} className={styles.fileItem}>
                            <div className={styles.fileInfo}>
                                <div className={styles.fileIcon}>{getFileIcon(fileObj.type)}</div>

                                <div className={styles.fileDetails}>
                                    <p className={styles.fileName}>{fileObj.name}</p>
                                    <p className={styles.fileSize}>{formatFileSize(fileObj.size)}</p>
                                </div>
                            </div>

                            <div className={styles.fileActions}>
                                {fileObj.status === 'success' && <CheckCircle className={styles.successIcon} />}
                                {fileObj.status === 'error' && <AlertCircle className={styles.errorIcon} />}

                                <button onClick={() => onRemoveFile(fileObj.id)} className={styles.removeButton} type="button">
                                    <X />
                                </button>
                            </div>

                            {fileObj.status === 'uploading' && (
                                <div className={styles.progressContainer}>
                                    <div className={styles.progressBar}>
                                        <div className={styles.progressFill} style={{ width: `${fileObj.progress}%` }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileUploadComponent;
