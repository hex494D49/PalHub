using PalHub.Api.Attributes;
using PalHub.Api.DTOs;

namespace PalHub.Api.Extensions
{
    public static class TypeExtensions
    {
        public static List<object> GetModelColumns(this Type modelType)
        {
            var columns = new List<object>();

            var properties = modelType.GetProperties();
            foreach (var property in properties)
            {
                var isSortable = Attribute.IsDefined(property, typeof(SortableAttribute));
                var isSearchable = Attribute.IsDefined(property, typeof(SearchableAttribute));

                var column = new
                {
                    name = property.Name,
                    dataType = property.PropertyType.GetFriendlyTypeName(),
                    isSortable,
                    isSearchable
                };

                columns.Add(column);
            }

            return columns;
        }

        public static string GetFriendlyTypeName(this Type type)
        {
            Type underlyingType = Nullable.GetUnderlyingType(type);
            if (underlyingType != null)
            {
                return underlyingType.GetFriendlyTypeName() + "?";
            }

            switch (type.Name)
            {
                case "String":
                    return "string";
                case "Int16":
                case "Int32":
                case "Int64":
                    return "int";
                case "Decimal":
                    return "decimal";
                case "Double":
                    return "double";
                case "Single":
                    return "float";
                case "Boolean":
                    return "boolean";
                case "DateTime":
                case "DateTimeOffset":
                    return "timestamp";
                default:
                    return type.Name.ToLower();
            }
        }
    }
}
