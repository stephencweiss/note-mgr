import { Command } from "commander";

function main() {
  const program = new Command();
  program.version("0.0.1", "-v --version", "Current Version");

  program.command("setup").alias("s").description("Setup the manager");
  program
    .command("create-draft <note-title>")
    .alias("c")
    .description("Creates a new draft note")
    .action((noteTitle) => {
      console.log(`Add draft creation here for ${noteTitle}`);
    });
  program
    .command("last-published")
    .alias("l")
    .description("Finds the date of the most recently published note")
    .action(() => {
      console.log(`Add last published here`);
    });
  program
    .command("publish <note-title>")
    .alias("p")
    .description("Publish a note")
    .option("-c --category <category>", "The frontmatter for category")
    .option("-p --publish <date>", "The frontmatter for publish")
    .option("-t --title <title>", "The frontmatter for the title")
    .option("--tags <tag...>", "The frontmatter for the title")
    .option("-i --interactive", "Interactively publish a note")
    .action((noteTitle, args) => {
      const { category, publish, title, tags } = args;
      console.log(
        `publish the given note: ${noteTitle} with args: ${category}, ${publish}, ${title}, ${tags}`
      );
    });
}
export default main;
