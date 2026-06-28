import { ASTGenerator } from './ASTGenerator';
import { SourceComposer } from './SourceComposer';
import { TemplateEngine } from './TemplateEngine';
import { FileWriterPlanner } from './FileWriterPlanner';
import { FolderStructureWriter } from './FolderStructureWriter';
import { ImportResolver } from './ImportResolver';
import { DependencyResolver } from './DependencyResolver';
import { NamingConventionEngine } from './NamingConventionEngine';
import { CodeConventionEngine } from './CodeConventionEngine';
import { ValidationEngine } from './ValidationEngine';

import { ReactGenerator } from './ReactGenerator';
import { NextJSGenerator } from './NextJSGenerator';
import { FlutterGenerator } from './FlutterGenerator';
import { ReactNativeGenerator } from './ReactNativeGenerator';
import { VueGenerator } from './VueGenerator';
import { AngularGenerator } from './AngularGenerator';
import { FastAPIGenerator } from './FastAPIGenerator';
import { NestGenerator } from './NestGenerator';
import { ASPNetGenerator } from './ASPNetGenerator';
import { SpringBootGenerator } from './SpringBootGenerator';
import { GoFiberGenerator } from './GoFiberGenerator';
import { RustActixGenerator } from './RustActixGenerator';
import { PythonGenerator } from './PythonGenerator';
import { CSharpGenerator } from './CSharpGenerator';
import { JavaGenerator } from './JavaGenerator';
import { KotlinGenerator } from './KotlinGenerator';
import { SwiftGenerator } from './SwiftGenerator';

import { SchemaGenerator } from './SchemaGenerator';
import { MigrationGenerator } from './MigrationGenerator';
import { ORMGenerator } from './ORMGenerator';
import { SeedGenerator } from './SeedGenerator';
import { RepositoryGenerator } from './RepositoryGenerator';

import { RESTGenerator } from './RESTGenerator';
import { GraphQLGenerator } from './GraphQLGenerator';
import { WebSocketGenerator } from './WebSocketGenerator';
import { GRPCGenerator } from './GRPCGenerator';

import { PromptGenerator } from './PromptGenerator';
import { AgentGenerator } from './AgentGenerator';
import { ToolGenerator } from './ToolGenerator';
import { MCPGenerator } from './MCPGenerator';

import { DocumentationGenerator } from './DocumentationGenerator';
import { TestGenerator } from './TestGenerator';
import { SecurityGenerator } from './SecurityGenerator';
import { PerformanceGenerator } from './PerformanceGenerator';
import { StaticAnalysisGenerator } from './StaticAnalysisGenerator';

import { PatchGenerator } from './PatchGenerator';
import { DiffGenerator } from './DiffGenerator';
import { GitCommitGenerator } from './GitCommitGenerator';
import { ReleasePackageGenerator } from './ReleasePackageGenerator';

export interface CodeGenPackage {
  success: boolean;
  projectName: string;
  files: Array<{ path: string; content: string }>;
  validationScore: number;
  diagnostics: {
    astNodesCount: number;
    resolvedImports: string[];
    validationErrors: string[];
  };
}

export class CodeGenerationEngine {
  private astGen = new ASTGenerator();
  private composer = new SourceComposer();
  private templates = new TemplateEngine();
  private writerPlanner = new FileWriterPlanner();
  private folderWriter = new FolderStructureWriter();
  private importResolver = new ImportResolver();
  private dependencyResolver = new DependencyResolver();
  private namingConvention = new NamingConventionEngine();
  private codeConvention = new CodeConventionEngine();
  private validator = new ValidationEngine();

  // Generators list
  private reactGen = new ReactGenerator();
  private nextjsGen = new NextJSGenerator();
  private flutterGen = new FlutterGenerator();
  private reactNativeGen = new ReactNativeGenerator();
  private vueGen = new VueGenerator();
  private angularGen = new AngularGenerator();
  private fastapiGen = new FastAPIGenerator();
  private nestGen = new NestGenerator();
  private aspnetGen = new ASPNetGenerator();
  private springbootGen = new SpringBootGenerator();
  private gofiberGen = new GoFiberGenerator();
  private rustactixGen = new RustActixGenerator();
  private pythonGen = new PythonGenerator();
  private csharpGen = new CSharpGenerator();
  private javaGen = new JavaGenerator();
  private kotlinGen = new KotlinGenerator();
  private swiftGen = new SwiftGenerator();

  private schemaGen = new SchemaGenerator();
  private migrationGen = new MigrationGenerator();
  private ormGen = new ORMGenerator();
  private seedGen = new SeedGenerator();
  private repositoryGen = new RepositoryGenerator();

  private restGen = new RESTGenerator();
  private graphqlGen = new GraphQLGenerator();
  private websocketGen = new WebSocketGenerator();
  private grpcGen = new GRPCGenerator();

  private promptGen = new PromptGenerator();
  private agentGen = new AgentGenerator();
  private toolGen = new ToolGenerator();
  private mcpGen = new MCPGenerator();

  private docsGen = new DocumentationGenerator();
  private testGen = new TestGenerator();
  private securityGen = new SecurityGenerator();
  private perfGen = new PerformanceGenerator();
  private analysisGen = new StaticAnalysisGenerator();

  private patchGen = new PatchGenerator();
  private diffGen = new DiffGenerator();
  private commitGen = new GitCommitGenerator();
  private releaseGen = new ReleasePackageGenerator();

  private sessionRunsCount = 0;
  private filesGeneratedCount = 0;

  public async generateCodeStructure(
    userInput: string,
    projectName: string,
    framework: string,
    _language: string
  ): Promise<CodeGenPackage> {
    this.sessionRunsCount++;

    // 1. Build AST & resolve templates
    const ast = this.astGen.generateAST(userInput);
    const templateContent = this.templates.getTemplate(framework);

    // 2. Compose raw code
    const rawCode = this.composer.compose(ast, templateContent);

    // 3. Apply imports & formatting conventions
    const resolvedImports = this.importResolver.resolveImports(rawCode);
    const importsPrefix = resolvedImports.join('\n') + '\n\n';
    const formattedCode = this.codeConvention.formatCode(importsPrefix + rawCode);

    // 4. Validate
    const validation = this.validator.validateSyntax(formattedCode);

    // 5. Generate files map
    const files: CodeGenPackage['files'] = [];

    // Main component file
    const compName = this.namingConvention.toPascalCase(projectName);
    const mainPath = `src/core/${this.namingConvention.toSnakeCase(projectName)}/${compName}.ts`;
    files.push({ path: mainPath, content: formattedCode });

    // DB Schema & ORM configs
    const schemaPath = `src/data/db/schema.prisma`;
    const ormContent = this.ormGen.generateORMConfig('postgresql');
    files.push({ path: schemaPath, content: ormContent });

    // Repository
    const repoPath = `src/data/db/repositories/${compName}Repository.ts`;
    const repoContent = this.repositoryGen.generateRepository(compName);
    files.push({ path: repoPath, content: repoContent });

    // REST route
    const restPath = `src/data/api/routes/${this.namingConvention.toSnakeCase(projectName)}Routes.ts`;
    const restContent = this.restGen.generateREST(`/api/v1/${this.namingConvention.toSnakeCase(projectName)}`, 'POST');
    files.push({ path: restPath, content: restContent });

    // AI Agent
    const agentPath = `src/core/agents/${compName}Agent.ts`;
    const agentContent = this.agentGen.generateAgentModel(compName);
    files.push({ path: agentPath, content: agentContent });

    // Eslint configuration
    const lintPath = `.eslintrc.json`;
    const lintContent = this.analysisGen.generateLinterRules();
    files.push({ path: lintPath, content: lintContent });

    // Git Commit details
    const commitMsg = this.commitGen.generateCommitMessage(projectName, files.length);
    files.push({ path: 'commit-message.txt', content: commitMsg });

    this.filesGeneratedCount += files.length;

    return {
      success: validation.valid,
      projectName,
      files,
      validationScore: validation.score,
      diagnostics: {
        astNodesCount: ast.children ? ast.children.length + 1 : 1,
        resolvedImports,
        validationErrors: validation.errors
      }
    };
  }

  public getSubGenerators(): any[] {
    return [
      this.writerPlanner,
      this.folderWriter,
      this.dependencyResolver,
      this.reactGen,
      this.nextjsGen,
      this.flutterGen,
      this.reactNativeGen,
      this.vueGen,
      this.angularGen,
      this.fastapiGen,
      this.nestGen,
      this.aspnetGen,
      this.springbootGen,
      this.gofiberGen,
      this.rustactixGen,
      this.pythonGen,
      this.csharpGen,
      this.javaGen,
      this.kotlinGen,
      this.swiftGen,
      this.schemaGen,
      this.migrationGen,
      this.seedGen,
      this.graphqlGen,
      this.websocketGen,
      this.grpcGen,
      this.promptGen,
      this.toolGen,
      this.mcpGen,
      this.docsGen,
      this.testGen,
      this.securityGen,
      this.perfGen,
      this.patchGen,
      this.diffGen,
      this.releaseGen
    ];
  }

  public getDiagnostics(): { sessionRunsCount: number; filesGeneratedCount: number } {
    return {
      sessionRunsCount: this.sessionRunsCount,
      filesGeneratedCount: this.filesGeneratedCount
    };
  }
}

export const codeGenerationEngine = new CodeGenerationEngine();
export default codeGenerationEngine;
