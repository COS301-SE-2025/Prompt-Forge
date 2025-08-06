const { createTransformer } = require('babel-jest').default || require('babel-jest');

// Create a transformer that replaces import.meta.env
const transformer = createTransformer({
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript'
  ],
  plugins: [
    // Transform import.meta.env to process.env
    function() {
      return {
        visitor: {
          MemberExpression(path) {
            if (
              path.node.object &&
              path.node.object.type === 'MetaProperty' &&
              path.node.object.meta.name === 'import' &&
              path.node.object.property.name === 'meta' &&
              path.node.property.name === 'env'
            ) {
              // Replace import.meta.env with process.env
              const t = this.types;
              path.replaceWith(
                t.memberExpression(
                  t.identifier('process'),
                  t.identifier('env')
                )
              );
            }
          }
        }
      };
    }
  ]
});

module.exports = transformer;
