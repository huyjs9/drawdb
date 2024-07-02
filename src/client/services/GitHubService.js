import { request as __request } from "../core/request";
import { encodeBase64, decodeBase64 } from "../../utils/utils";

const getScopes = (token) => [
  token.repoFullAccess ? "repo" : "public_repo",
  "gist",
];

const repoRequest = (token, owner, repo, options) =>
  __request({
    ...options,
    url: "https://api.github.com/repos/{owner}/{repo}/{url}",
    path: {
      owner,
      repo,
      url: options.url,
      ...options.path,
    },
    query: {
      ...options.query,
      t: Date.now(), // Prevent from caching
    },
    headers: {
      ...(options.headers ?? {}),
      Authorization: `token ${token.accessToken}`,
    },
  });

const getCommitMessage = (name, path) => {
  // TODO: defensive
  const settings = localStorage.getItem("settings");
  const message = JSON.parse(settings).git[name];
  return message.replace(/{{path}}/g, path);
};

export class RepoService {
  constructor() {
    this.subPrefix = "gh";
  }

  static async getTree({ token, owner, repo, branch }) {
    const { commit } = await repoRequest(token, owner, repo, {
      url: "commits/{branch}",
      path: { branch },
    });
    const { tree, truncated } = await repoRequest(token, owner, repo, {
      url: "git/trees/{sha}?recursive=1",
      path: {
        sha: commit.tree.sha,
      },
    });
    if (truncated) {
      throw new Error(
        "Git tree too big. Please remove some files in the repository.",
      );
    }
    return tree;
  }

  static async getCommits({ token, owner, repo, sha, path }) {
    return repoRequest(token, owner, repo, {
      url: "commits",
      query: { sha, path },
    });
  }

  static async uploadFile({ token, owner, repo, branch, path, content, sha }) {
    return repoRequest(token, owner, repo, {
      method: "PUT",
      url: "contents/{path}",
      path: {
        path,
      },
      body: {
        message: getCommitMessage(
          sha ? "updateFileMessage" : "createFileMessage",
          path,
        ),
        content: encodeBase64(content),
        sha,
        branch,
      },
    });
  }

  static async removeFile({ token, owner, repo, branch, path, sha }) {
    return repoRequest(token, owner, repo, {
      method: "DELETE",
      url: "contents/{path}",
      path: {
        path,
      },
      body: {
        message: getCommitMessage("deleteFileMessage", path),
        sha,
        branch,
      },
    });
  }

  static async downloadFile({ token, owner, repo, branch, path }) {
    const { sha, content } = await repoRequest(token, owner, repo, {
      url: "contents/{path}",
      path: {
        path,
      },
      query: { ref: branch },
    });
    return {
      sha,
      data: decodeBase64(content),
    };
  }
}

export class UserService {
  static async getUser(sub) {
    return __request({
      url: "https://api.github.com/user/{sub}",
      path: {
        sub,
      },
    });
  }
}
