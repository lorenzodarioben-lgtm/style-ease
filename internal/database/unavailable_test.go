package database_test

import (
	"errors"
	"github.com/lorenzodarioben-lgtm/style-ease/internal/database"
	"github.com/lorenzodarioben-lgtm/style-ease/internal/domain"
	"github.com/lorenzodarioben-lgtm/style-ease/internal/testsupport"
	"testing"
)

func TestArchivedOwnedSelectionsRemainRecoverable(t *testing.T) {
	d := testsupport.DB(t)
	s := guest(t, d)
	p := catalog(t, d)[0]
	v := p.Variants[0].ID
	for _, a := range []string{"add", "wish"} {
		if e := d.Mutate(ctx, s.Key, a, v, 1); e != nil {
			t.Fatal(e)
		}
	}
	if e := d.SaveLook(ctx, s.Key, "Original look", []int{v}); e != nil {
		t.Fatal(e)
	}
	if _, e := d.Pool.Exec(ctx, `UPDATE products SET active=false WHERE id=$1`, p.ID); e != nil {
		t.Fatal(e)
	}
	public := catalog(t, d)
	if len(public) != 19 {
		t.Fatal("archive still public")
	}
	state, e := d.Snapshot(ctx, s.Key, public)
	if e != nil || len(state.Bag) != 1 || len(state.Wishlist) != 1 || len(state.Looks) != 1 || len(state.Looks[0].Lines) != 1 {
		t.Fatal("owned selection silently disappeared", e)
	}
	if state.Bag[0].Variant.Active || state.Looks[0].Total != 7500 {
		t.Fatal("availability/total incorrect")
	}
	if _, e = d.Checkout(ctx, s.Key, database.Token()); !errors.Is(e, domain.ErrInvalid) {
		t.Fatal("archived checkout accepted", e)
	}
	if e = d.Mutate(ctx, s.Key, "remove", v, 1); e != nil {
		t.Fatal(e)
	}
	state, e = d.Snapshot(ctx, s.Key, public)
	if e != nil || len(state.Bag) != 0 {
		t.Fatal("archived selection cannot be removed", e)
	}
	other := guest(t, d)
	state, e = d.Snapshot(ctx, other.Key, public)
	if e != nil || len(state.Wishlist) != 0 || len(state.Looks) != 0 {
		t.Fatal("archived owner data leaked", e)
	}
}
