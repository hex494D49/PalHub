namespace PalHub.Api.Attributes
{
    [AttributeUsage(AttributeTargets.Property)]
    public class SearchableAttribute : Attribute
    {
        public bool IsSearchable { get; set; }

        public SearchableAttribute(bool isSearchable = true)
        {
            IsSearchable = isSearchable;
        }
    }
}
