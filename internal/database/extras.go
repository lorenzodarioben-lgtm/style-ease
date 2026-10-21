package database

import (
	"context"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/lorenzodarioben-lgtm/style-ease/internal/domain"
)

func (d *DB) Reviews(ctx context.Context, key string, id int, order string) ([]domain.Review, error) {
	q := `SELECT rating,comment,to_char(created_at AT TIME ZONE 'UTC','YYYY-MM-DD') FROM demo_reviews WHERE session_id=$1 AND product_id=$2 ORDER BY created_at DESC LIMIT 50`
	if order == "highest" {
		q = `SELECT rating,comment,to_char(created_at AT TIME ZONE 'UTC','YYYY-MM-DD') FROM demo_reviews WHERE session_id=$1 AND product_id=$2 ORDER BY rating DESC,created_at DESC LIMIT 50`
	}
	rows, e := d.Pool.Query(ctx, q, key, id)
	if e != nil {
		return nil, e
	}
	defer rows.Close()
	out := []domain.Review{}
	for rows.Next() {
		var r domain.Review
		if e = rows.Scan(&r.Rating, &r.Comment, &r.Created); e != nil {
			return nil, e
		}
		out = append(out, r)
	}
	return out, rows.Err()
}
func (d *DB) Review(ctx context.Context, key string, id, rating int, comment string) error {
	comment = strings.TrimSpace(comment)
	if len([]rune(comment)) < 1 || len([]rune(comment)) > 500 || rating < 1 || rating > 5 {
		return domain.ErrInvalid
	}
	return d.locked(ctx, key, func(tx pgx.Tx) error {
		var n int
		if e := tx.QueryRow(ctx, `SELECT count(*) FROM demo_reviews WHERE session_id=$1 AND product_id=$2`, key, id).Scan(&n); e != nil {
			return e
		}
		if n >= 50 {
			return domain.ErrLimit
		}
		tag, e := tx.Exec(ctx, `INSERT INTO demo_reviews(session_id,product_id,rating,comment) SELECT $1,id,$3,$4 FROM products WHERE id=$2 AND active`, key, id, rating, comment)
		if e != nil {
			return e
		}
		if tag.RowsAffected() != 1 {
			return domain.ErrInvalid
		}
		return nil
	})
}
func (d *DB) SaveLook(ctx context.Context, key, name string, variants []int) error {
	if len([]rune(name)) < 1 || len([]rune(name)) > 60 || len(variants) < 1 || len(variants) > 8 {
		return domain.ErrInvalid
	}
	return d.locked(ctx, key, func(tx pgx.Tx) error {
		var count int
		if e := tx.QueryRow(ctx, `SELECT count(*) FROM saved_looks WHERE session_id=$1`, key).Scan(&count); e != nil {
			return e
		}
		if count >= 12 {
			return domain.ErrLimit
		}
		id := Token()[:24]
		if _, e := tx.Exec(ctx, `INSERT INTO saved_looks(id,session_id,name) VALUES($1,$2,$3)`, id, key, name); e != nil {
			return e
		}
		seen := map[int]bool{}
		for i, v := range variants {
			if seen[v] {
				return domain.ErrInvalid
			}
			seen[v] = true
			tag, e := tx.Exec(ctx, `INSERT INTO saved_look_items(look_id,variant_id,ordinal) SELECT $1,v.id,$3 FROM product_variants v JOIN products p ON p.id=v.product_id WHERE v.id=$2 AND v.active AND p.active`, id, v, i)
			if e != nil {
				return e
			}
			if tag.RowsAffected() != 1 {
				return domain.ErrInvalid
			}
		}
		return nil
	})
}
func (d *DB) LookAction(ctx context.Context, key, id, action, name string) error {
	return d.locked(ctx, key, func(tx pgx.Tx) error {
		var owner string
		if e := tx.QueryRow(ctx, `SELECT session_id FROM saved_looks WHERE id=$1 AND session_id=$2`, id, key).Scan(&owner); e == pgx.ErrNoRows {
			return domain.ErrNotFound
		} else if e != nil {
			return e
		}
		switch action {
		case "delete":
			_, e := tx.Exec(ctx, `DELETE FROM saved_looks WHERE id=$1 AND session_id=$2`, id, key)
			return e
		case "rename":
			if len([]rune(name)) < 1 || len([]rune(name)) > 60 {
				return domain.ErrInvalid
			}
			_, e := tx.Exec(ctx, `UPDATE saved_looks SET name=$1 WHERE id=$2 AND session_id=$3`, name, id, key)
			return e
		case "bag":
			rows, e := tx.Query(ctx, `SELECT variant_id FROM saved_look_items WHERE look_id=$1 ORDER BY ordinal`, id)
			if e != nil {
				return e
			}
			vs := []int{}
			for rows.Next() {
				var v int
				if e = rows.Scan(&v); e != nil {
					rows.Close()
					return e
				}
				vs = append(vs, v)
			}
			e = rows.Err()
			rows.Close()
			if e != nil {
				return e
			}
			for _, v := range vs {
				if e = add(ctx, tx, key, v, 1, false); e != nil {
					return e
				}
			}
			return nil
		default:
			return domain.ErrInvalid
		}
	})
}
