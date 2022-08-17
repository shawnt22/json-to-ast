export namespace AST {
  interface Options {
    /**
     * Appends location information.
     *
     * @default true
     */
    loc?: boolean | undefined;
  
    /**
     * Appends source information to node’s location.
     *
     * @default null
     */
    source?: string | undefined;
  }
  
  type ValueNode = ObjectNode | ArrayNode | LiteralNode;
  
  interface Position {
    line: number;
    column: number;
    offset: number;
  }
  
  interface Location {
    start: Position;
    end: Position;
    source: string | null;
  }
  
  interface ASTNode {
    type: string;
    loc?: Location | undefined;
  }
  
  interface ObjectNode extends ASTNode {
    type: "Object";
    children: PropertyNode[];
  }
  
  interface PropertyNode extends ASTNode {
    type: "Property";
    key: IdentifierNode;
    value: ValueNode;
  }
  
  interface IdentifierNode extends ASTNode {
    type: "Identifier";
    value: string;
    raw: string;
  }
  
  interface ArrayNode extends ASTNode {
    type: "Array";
    children: ValueNode[];
  }
  
  interface LiteralNode extends ASTNode {
    type: "Literal";
    value: string | number | boolean | null;
    raw: string;
  }
  interface IToken {
    type: number;
    loc?: Location | undefined;
    value: any;
  }
}
export namespace JAST {

  type JValue = JObject | JArray | JLiteral;

  interface JPosition {
      line: number;
      column: number;
      offset: number;
  }

  interface JLocation {
      start: JPosition;
      end: JPosition;
      source?: string | null;
  }

  interface JEsNode {
    range: number[];
    parent?: JNode;
    children?: JNode[];
  }

  interface JNode extends JEsNode {
      type: string;
      loc?: JLocation;
  }

  interface JObject extends JNode {
      type: "Object";
      children: JProperty[];
  }

  interface JProperty extends JNode {
      type: "Property";
      key: JIdentifier;
      value: JValue;
  }

  interface JIdentifier extends JNode {
      type: "Identifier";
      value: string;
      raw: string;
  }

  interface JArray extends JNode {
      type: "Array";
      children: JValue[];
  }

  interface JLiteral extends JNode {
      type: "Literal";
      value: string | number | boolean | null;
      raw: string;
  }

  /**
   * 新增 Program
   */
  interface JProgram extends JNode {
    type: 'Program';  //  必须带有 Program 类型节点
    body: JNode[];    //  必须带有 body 属性，eslint-scope时会默认访问该属性
    tokens: JToken[];
    comments: JToken[];
  }
  interface JToken extends JNode {
    value: string;
  }
}
export declare function parse(input: string, settings?: AST.Options): AST.ValueNode | undefined;
export declare function tokenize(input: string, settings?: AST.Options): AST.IToken[];