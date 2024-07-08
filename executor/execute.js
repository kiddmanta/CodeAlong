    const express = require('express');
    const { exec } = require('child_process');
    const fs = require('fs');
    const path = require('path');
    const asyncHandler = require('express-async-handler');

    const app = express();
    app.use(express.json());

    const executeCode = asyncHandler(async (req, res) => {
        // console.log('Executing code...');
        const { code, language, input } = req.body;

        if (!code || !language) {
            return res.status(400).json({ msg: 'Code and language are required' });
        }

        let codeFileName = '';
        let compileCommand = '';
        let runCommand = '';

        if (language === 'java') {
            // Extract the main class name from the Java code
            const classNameMatch = code.match(/class\s+(\w+)/);
            if (classNameMatch) {
                const className = classNameMatch[1];
                codeFileName = `${className}.java`;
            } else {
                return res.status(400).json({ msg: 'Java class name not found in code' });
            }
        } else {
            codeFileName = `code.${language}`;
        }

        const codePath = path.join(__dirname, codeFileName);
        fs.writeFileSync(codePath, code);

        const inputFileName = 'input.txt';
        const inputPath = path.join(__dirname, inputFileName);
        fs.writeFileSync(inputPath, input);

        const outputFileName = 'output.txt';
        const outputPath = path.join(__dirname, outputFileName);

        switch (language) {
            case 'c':
                compileCommand = `gcc ${codeFileName} -o ${path.basename(codeFileName, '.c')}`;
                runCommand = `./${path.basename(codeFileName, '.c')} < ${inputFileName} > ${outputFileName}`;
                break;

            case 'cpp':
                compileCommand = `g++ ${codeFileName} -o ${path.basename(codeFileName, '.cpp')}`;
                runCommand = `./${path.basename(codeFileName, '.cpp')} < ${inputFileName} > ${outputFileName}`;
                break;

            case 'java':
                compileCommand = `javac ${codeFileName}`;
                runCommand = `java ${path.basename(codeFileName, '.java')} < ${inputFileName} > ${outputFileName}`;
                break;

            case 'python':
                runCommand = `python ${codeFileName} < ${inputFileName} > ${outputFileName}`;
                break;

            default:
                return res.status(400).json({ msg: 'Invalid language' });
        }

        const execute = (command, callback) => {
            exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
                if (error) {
                    return callback(stderr);
                }
                callback(null, stdout);
            });
        };

        if (compileCommand) {
            execute(compileCommand, (compileError) => {
                if (compileError) {
                    return res.status(400).json({ msg: compileError });
                }
                execute(runCommand, (runError) => {
                    if (runError) {
                        return res.status(400).json({ msg: runError });
                    }
                    const output = fs.readFileSync(outputPath, 'utf-8');
                    res.status(200).json({ output });
                });
            });
        } else {
            execute(runCommand, (runError) => {
                if (runError) {
                    return res.status(400).json({ msg: runError });
                }
                const output = fs.readFileSync(outputPath, 'utf-8');
                res.status(200).json({ output });
            });
        }
    });

    app.post('/execute', executeCode);

    const PORT = 5002;
    app.listen(PORT, () => {
        console.log(`Executor service running on port ${PORT}`);
    });
