package domain

import (
	"net/url"
	"strings"
	"testing"
)

func TestQueryContract(t *testing.T) {
	q := ParseQuery(url.Values{"q": {"  cotton black  "}, "category": {"T-Shirts"}, "sort": {"DROP TABLE products"}, "page": {"-90"}, "inStock": {"1"}})
	if q.Search != "cotton black" || q.Category != "Tops" || q.Sort != "featured" || q.Page != 1 || !q.InStock {
		t.Fatalf("bad normalization: %+v", q)
	}
	q = ParseQuery(url.Values{"q": {strings.Repeat("é", 200)}, "page": {"999999"}})
	if len([]rune(q.Search)) != 100 || q.Page != 1000 {
		t.Fatal(q)
	}
}
func TestAttributeSearchFiltersSort(t *testing.T) {
	ps := []Product{{ID: 1, Name: "Axis Shirt", Category: "Tops", Material: "Cotton", Colors: []string{"Black"}, Sizes: []string{"M"}, Stock: 2, Price: 7500}, {ID: 2, Name: "Grid Sweater", Category: "Sweaters", Material: "Cotton", Colors: []string{"Gray"}, Sizes: []string{"M"}, Stock: 0, Price: 14500}}
	for _, tc := range []struct {
		name string
		q    Query
		want int
	}{{"attribute intersection", Query{Search: "cotton black", Size: "M"}, 1}, {"comma lists", Query{Category: "Tops,Jackets", Color: "Gray,Black"}, 1}, {"empty", Query{Search: "impossible"}, 0}, {"stock", Query{InStock: true}, 1}, {"price", Query{Price: "Over $100"}, 1}, {"collection", Query{Collection: "structure"}, 0}} {
		t.Run(tc.name, func(t *testing.T) {
			if got := len(Filter(ps, tc.q)); got != tc.want {
				t.Fatalf("got %d want %d", got, tc.want)
			}
		})
	}
	if Filter(ps, Query{Sort: "price-desc"})[0].ID != 2 {
		t.Fatal("sort failed")
	}
}
func TestMoneyAndSharedCapacity(t *testing.T) {
	if Money(7501) != "$75.01" {
		t.Fatal(Money(7501))
	}
	if Total([]Line{{Product: Product{Price: 7501}, Quantity: 3}}) != 22503 {
		t.Fatal("money must use integer arithmetic")
	}
	for _, tc := range []struct {
		s, e, q int
		valid   bool
	}{{8, 7, 1, true}, {8, 7, 2, false}, {8, 0, 0, false}, {8, 0, -1, false}, {99, 0, 100, false}} {
		if (ValidateQuantity(tc.s, tc.e, tc.q) == nil) != tc.valid {
			t.Fatal(tc)
		}
	}
}
func TestVariantAndRelations(t *testing.T) {
	p := Product{ID: 1, Category: "Tops", Variants: []Variant{{ID: 7, Size: "M", Color: "Black", Active: true}, {ID: 8, Size: "L", Color: "Black", Active: false}}}
	if v, e := p.Variant("M", "Black"); e != nil || v.ID != 7 {
		t.Fatal(v, e)
	}
	if _, e := p.Variant("L", "Black"); e == nil {
		t.Fatal("inactive variant accepted")
	}
	if len(Related([]Product{p, {ID: 2, Category: "Tops"}, {ID: 3, Category: "Shoes"}}, p)) != 1 {
		t.Fatal("relation mismatch")
	}
}
