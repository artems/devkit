import GitHub from 'github';

export default function setup(options, imports) {

  const github = new GitHub(options);

  if (options.authenticate) {
    github.authenticate(options.authenticate);
  }

  return github;

}
