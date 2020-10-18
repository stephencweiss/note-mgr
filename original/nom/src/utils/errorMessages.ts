import chalk from "chalk"

/**
 * The printError function is meant to be used in actions - the top of the stack where all of the errors will have bubbled up to
 * @param message the message to print
 */
export function printError(error: string, message?: string) {
    console.error(
        chalk.red.bold(`Error!`),
        `\n`,
        `${message ? generateErrorMessage(error, message) : `\t${error}`}`
    )
}

/**
 * The purpose of generate error message is to standardize how error messages are written
 * @param message Any additional detail to pass along with the error message
 */
export function generateErrorMessage(error: string, message?: string) {
    return `${message && `\n${chalk.red(message)}\n`}\t${error}`
}
