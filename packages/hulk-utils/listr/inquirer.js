const through = require('through');
const inquirer = require('inquirer');
const Observable = require('rxjs').Observable;

module.exports = (questions, done) => {
    if (!Array.isArray(questions)) {
        questions = [questions];
    }

    return new Observable(observer => {
        let buffer = '';

        const outputStream = through(data => {
            if (/\u001b\[.*?(D|C)$/.test(data)) {
                if (buffer.length > 0) {
                    observer.next(buffer);
                    buffer = '';
                }
                return;
            }

            buffer += data;
        });

        const prompt = inquirer.createPromptModule({
            output: outputStream
        });

        prompt(questions)
            .then(answers => {
                // Clear the output
                observer.next();

                return done(answers);
            })
            .then(() => {
                observer.complete();
            })
            .catch(err => {
                observer.error(err);
            });

        return outputStream;
    });
};
