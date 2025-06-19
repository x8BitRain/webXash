interface Options {
  recursive: boolean;
}

export interface FilesWithPath {
  file: File;
  path: string;
}

const getFiles = async (
  dirHandle: any,
  recursive: boolean,
  path: string = dirHandle.name,
): Promise<FilesWithPath[]> => {
  const dirs: Promise<FilesWithPath[]>[] = [];
  const files: FilesWithPath[] = [];

  for await (const entry of dirHandle.values()) {
    const nestedPath = `${path}/${entry.name}`;
    if (entry.kind === 'file') {
      const file = await entry.getFile();
      files.push({
        file: file,
        path: nestedPath,
      });
    } else if (entry.kind === 'directory' && recursive) {
      dirs.push(getFiles(entry, recursive, nestedPath));
    }
  }

  const resolvedDirs = await Promise.all(dirs);
  return [...resolvedDirs.flat(), ...files];
};

export default async (options: Options): Promise<FilesWithPath[]> => {
  options.recursive = options.recursive || false;
  // @ts-ignore -- it does exist
  const handle = await window.showDirectoryPicker();
  return await getFiles(handle, options.recursive);
};
