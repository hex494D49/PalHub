namespace PalHub.Api.Attributes
{
    [AttributeUsage(AttributeTargets.Property)]
    public class SortableAttribute : Attribute
    {
        public bool IsSortable { get; set; }

        public SortableAttribute(bool isSortable = true)
        {
            IsSortable = isSortable;
        }
    }

}
