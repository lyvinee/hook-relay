interface Storage {
  upload(filename: string): Promise<string>;
}

interface Compute {
  run(code: string): Promise<string>;
}

class AwsStorage implements Storage {
  async upload(filename: string): Promise<string> {
    return `https://s3.amazonaws.com/${filename}`;
  }
}

class AwsCompute implements Compute {
  async run(code: string): Promise<string> {
    return `https://run.aws-us-east-1.amazonaws.com/v2/0b0f0d0e-0c0d-0e0f-0a0b-0c0d0e0f00/run.js`;
  }
}

class GoogleStorage implements Storage {
  async upload(filename: string): Promise<string> {
    return `https://storage.googleapis.com/${filename}`;
  }
}

class GoogleCompute implements Compute {
  async run(code: string): Promise<string> {
    return `https://run.googleapis.com/v2/0b0f0d0e-0c0d-0e0f-0a0b-0c0d0e0f00/run.js`;
  }
}

interface CloudProvider {
  createStorage(): Storage;
  createCompute(): Compute;
}

class AwsCloudProvider implements CloudProvider {
  createStorage(): Storage {
    return new AwsStorage();
  }

  createCompute(): Compute {
    return new AwsCompute();
  }
}

class GoogleCloudProvider implements CloudProvider {
  createStorage(): Storage {
    return new GoogleStorage();
  }

  createCompute(): Compute {
    return new GoogleCompute();
  }
}

const awsCloudProvider = new AwsCloudProvider();
const googleCloudProvider = new GoogleCloudProvider();

function deploy(cloudProvider: CloudProvider) {
  const storage = cloudProvider.createStorage();
  const compute = cloudProvider.createCompute();

  const url = storage.upload("test.txt");
  console.log(url);

  const result = compute.run("console.log('hello world')");
  console.log(result);
}

function main() {
  const isGoogle = true;
  const provider = isGoogle ? googleCloudProvider : awsCloudProvider;

  deploy(provider);
}

main();
