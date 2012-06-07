/*
 * Copyright 2012 JBoss Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.drools.java.nio.fs.base;

import java.util.concurrent.TimeUnit;

import org.drools.java.nio.file.attribute.BasicFileAttributes;
import org.drools.java.nio.file.attribute.FileTime;

import static org.drools.java.nio.util.Preconditions.*;

public class GeneralFileAttributes implements BasicFileAttributes {

    private final GeneralPathImpl generalPath;
    private final FileTime lastModifiedTime;
    private final boolean exists;
    private final boolean isRegularFile;
    private final boolean isDirectory;
    private final boolean isHidden;
    private final boolean isExecutable;
    private final boolean isReadable;
    private long fileLenght = -1;

    GeneralFileAttributes(final GeneralPathImpl generalPath) {
        this.generalPath = checkNotNull("generalPath", generalPath);
        final long lastModified = generalPath.toFile().lastModified();
        this.lastModifiedTime = new FileTime() {

            @Override
            public long to(TimeUnit unit) {
                return unit.convert(lastModified, TimeUnit.MILLISECONDS);
            }

            @Override
            public long toMillis() {
                return lastModified;
            }

            @Override
            public int compareTo(FileTime o) {
                return 0;
            }
        };
        this.exists = generalPath.toFile().exists();
        this.isRegularFile = generalPath.toFile().isFile();
        this.isDirectory = generalPath.toFile().isDirectory();
        this.isHidden = generalPath.toFile().isHidden();
        this.isExecutable = generalPath.toFile().canExecute();
        this.isReadable = generalPath.toFile().canRead();
    }

    @Override
    public FileTime lastModifiedTime() {
        return lastModifiedTime;
    }

    @Override
    public FileTime lastAccessTime() {
        return null;
    }

    @Override
    public FileTime creationTime() {
        return null;
    }

    @Override
    public boolean isRegularFile() {
        return isRegularFile;
    }

    @Override
    public boolean isDirectory() {
        return isDirectory;
    }

    @Override
    public boolean isSymbolicLink() {
        return false;
    }

    @Override
    public boolean isOther() {
        return false;
    }

    @Override
    public long size() {
        if (fileLenght == -1) {
            fileLenght = generalPath.toFile().length();
        }
        return fileLenght;
    }

    @Override
    public Object fileKey() {
        return null;
    }

    public boolean exists() {
        return exists;
    }

    public boolean isReadable() {
        return isReadable;
    }

    public boolean isExecutable() {
        return isExecutable;
    }

    public boolean isHidden() {
        return isHidden;
    }
}
